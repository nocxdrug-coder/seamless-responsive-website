/**
 * POST /api/login      — authenticate user, set session cookie
 * GET  /api/login      — return session status
 * GET  /api/login?action=logout — destroy session cookie
 *
 * Lock system: 5 wrong passwords → 10-minute account lockout (stored in DB).
 * Bypass available at /only-god-access-x9k2 (secret URL, not in UI).
 */


function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

/** Formats milliseconds as "Xh Ym" or "Ym Zs" */
function formatRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function loader({ request }: { request: Request }) {
  const { destroySessionCookie, parseSession } = await import("~/server/session.server");
  const { logSecurityEvent } = await import("~/server/security-log.server");
  const { getClientIp } = await import("~/server/ip-security.server");

  const url = new URL(request.url);

  if (url.searchParams.get("action") === "logout") {
    const session = parseSession(request);
    if (session) {
      logSecurityEvent("LOGIN_SUCCESS", getClientIp(request), {
        userId: session.userId,
        detail: "logout",
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": destroySessionCookie(request),
      },
    });
  }

  const session = parseSession(request);
  if (!session) return json({ authenticated: false });
  return json({ authenticated: true, userId: session.userId, role: session.role });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function action({ request }: { request: Request }) {
  const { findUserByEmail, verifyPassword, ensureSeeded } = await import("~/server/db.server");
  const { createSessionCookie } = await import("~/server/session.server");
  const { loginLimiter } = await import("~/server/rate-limiter.server");
  const { logSecurityEvent, sanitizeEmail, isValidEmail } = await import("~/server/security-log.server");
  const { getLockStatus, recordFailedAttempt, resetLoginLock, MAX_FAILED_ATTEMPTS } = await import("~/server/login-lock.server");
  const { getClientIp, isIpBanned, logIpActivity, bannedResponse } = await import("~/server/ip-security.server");
  const { logMissingUserAuthEnv } = await import("~/server/env.server");
  const { logServerError } = await import("~/server/server-logging.server");

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const missingEnv = logMissingUserAuthEnv("api/login");
  if (missingEnv.length > 0) {
    return json(
      {
        error:
          "Authentication is not configured on the server. Set SUPABASE_URL, SESSION_SECRET, and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY for Production/Preview on Vercel.",
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);

  // ── IP ban check (highest priority — must come before everything else) ─────
  if (await isIpBanned(ip)) {
    logIpActivity(request, { action: "login", status: "blocked" });
    return bannedResponse();
  }

  // ── IP-level rate limiting (rough burst guard) ─────────────────────────────
  if (!loginLimiter.check(ip)) {
    const retryAfter = loginLimiter.retryAfterSeconds(ip);
    logSecurityEvent("RATE_LIMITED", ip, { detail: "login" });
    return json(
      { error: `Too many requests. Please try again in ${retryAfter} seconds.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, { status: 400 });
  }

  const email    = sanitizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !isValidEmail(email)) {
    return json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!password || password.length < 1) {
    return json({ error: "Password is required" }, { status: 400 });
  }
  if (password.length > 128) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  // ── Database operations ────────────────────────────────────────────────────
  try {
    await ensureSeeded();

    const user = await findUserByEmail(email);

    // ── Account-level lock check (before bcrypt to save compute) ────────────
    if (user) {
      const lock = await getLockStatus(user.id);
      if (lock.locked) {
        const timeLeft = formatRemaining(lock.remainingMs);
        logSecurityEvent("LOGIN_BLOCKED", ip, {
          email,
          userId: user.id,
          detail: `account_locked_${timeLeft}_remaining`,
        });
        return json(
          {
            error: `Account is locked. Too many failed attempts.\nPlease try again in ${timeLeft} or contact support.`,
            locked:       true,
            remainingMs:  lock.remainingMs,
            lockedUntil:  lock.lockedUntil,
          },
          { status: 423 } // 423 Locked
        );
      }
    }

    // ── Timing-safe password check ─────────────────────────────────────────
    // Always run bcrypt even if user not found (prevents user enumeration).
    const passwordValid = user ? await verifyPassword(user, password) : false;

    if (!user || !passwordValid) {
      // Record failed attempt for known users
      if (user) {
        const lockStatus = await recordFailedAttempt(user.id);
        const attemptsLeft = MAX_FAILED_ATTEMPTS - lockStatus.failedAttempts;

        if (lockStatus.locked) {
          logSecurityEvent("ACCOUNT_LOCKED", ip, {
            email,
            userId: user.id,
            detail: `locked_after_${lockStatus.failedAttempts}_attempts`,
          });
          return json(
            {
              error: `Account locked for 10 minutes due to too many failed attempts.\nContact support or try again later.`,
              locked:      true,
              remainingMs: lockStatus.remainingMs,
              lockedUntil: lockStatus.lockedUntil,
            },
            { status: 423 }
          );
        }

        // Warn user how many attempts remain before lock
        if (attemptsLeft <= 2 && attemptsLeft > 0) {
          logSecurityEvent("LOGIN_FAILED", ip, { email, detail: "wrong_password" });
          return json(
            {
              error: `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining before account lock.`,
            },
            { status: 401 }
          );
        }
      }

      logSecurityEvent("LOGIN_FAILED", ip, { email, detail: user ? "wrong_password" : "no_user" });
      logIpActivity(request, { userId: user?.id, action: "login", status: "failed" });
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ── Success — clear lock, set session ──────────────────────────────────
    await resetLoginLock(user.id);
    loginLimiter.reset(ip);
    logSecurityEvent("LOGIN_SUCCESS", ip, { email, userId: user.id });
    logIpActivity(request, { userId: user.id, action: "login", status: "success" });

    const sessionCookie = createSessionCookie({ userId: user.id, role: user.role }, request);

    return json(
      { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { headers: { "Set-Cookie": sessionCookie } }
    );

  } catch (err) {
    logServerError("api/login", err);
    return json(
      { error: "Service temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
