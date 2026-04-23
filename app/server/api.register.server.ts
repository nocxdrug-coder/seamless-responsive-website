/**
 * POST /api/register — create user account, set session cookie
 */

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export async function action({ request }: { request: Request }) {
  const { createUser, ensureSeeded } = await import("~/server/db.server");
  const { createSessionCookie } = await import("~/server/session.server");
  const { registerLimiter } = await import("~/server/rate-limiter.server");
  const { logSecurityEvent, sanitizeEmail, sanitizeString, isValidEmail } = await import(
    "~/server/security-log.server"
  );
  const { getClientIp, isIpBanned, logIpActivity, bannedResponse } = await import("~/server/ip-security.server");
  const { logMissingUserAuthEnv } = await import("~/server/env.server");
  const { logServerError } = await import("~/server/server-logging.server");

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const missingEnv = logMissingUserAuthEnv("api/register");
  if (missingEnv.length > 0) {
    return json(
      {
        error:
          "Registration is not configured on the server. Set SUPABASE_URL, SESSION_SECRET, and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY on Vercel.",
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);

  if (await isIpBanned(ip)) {
    logIpActivity(request, { action: "register", status: "blocked" });
    return bannedResponse();
  }

  if (!registerLimiter.check(ip)) {
    const retryAfter = registerLimiter.retryAfterSeconds(ip);
    logSecurityEvent("RATE_LIMITED", ip, { detail: "register" });
    return json(
      { error: `Registration limit reached. Try again in ${retryAfter} seconds.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: { email?: unknown; name?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = sanitizeEmail(body.email);
  const name = sanitizeString(body.name, 80);
  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (!email || !isValidEmail(email)) {
    return json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (password.length > 128) {
    return json({ error: "Password too long" }, { status: 400 });
  }

  try {
    await ensureSeeded();

    const user = await createUser(email, name, password);
    if (!user) {
      logSecurityEvent("REGISTER_FAILED", ip, { email, detail: "email_taken" });
      logIpActivity(request, { action: "register", status: "failed" });
      return json({ error: "Email address already registered" }, { status: 409 });
    }

    logSecurityEvent("LOGIN_SUCCESS", ip, { email, userId: user.id, detail: "register" });
    logIpActivity(request, { userId: user.id, action: "register", status: "success" });

    const sessionCookie = createSessionCookie({ userId: user.id, role: user.role }, request);

    return json(
      { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201, headers: { "Set-Cookie": sessionCookie } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logServerError("api/register", err);
    registerLimiter.reset(ip);
    return json(
      {
        error:
          msg.includes("RLS") || msg.includes("service_role")
            ? "Registration failed: database not configured. Contact support."
            : "Registration temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}
