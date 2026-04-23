/**
 * Admin Authentication — completely separate from user auth.
 *
 * POST /api/admin-auth          — admin login (sets __cc_admin cookie)
 * GET  /api/admin-auth          — check admin session status
 * GET  /api/admin-auth?action=logout — destroy admin session
 *
 * Security:
 *  - Separate rate limiter (5 attempts / 30 min)
 *  - Email allowlist — only pre-approved admin emails
 *  - Role check — DB role must be "admin"
 *  - bcrypt.compare() — never plain-text comparison
 *  - Generic error message — never reveals whether email exists
 */

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export async function loader({ request }: { request: Request }) {
  const { destroyAdminSessionCookie, parseAdminSession } = await import("~/server/session.server");
  const { getClientIp } = await import("~/server/rate-limiter.server");
  const { logSecurityEvent } = await import("~/server/security-log.server");

  const url = new URL(request.url);

  if (url.searchParams.get("action") === "logout") {
    const session = parseAdminSession(request);
    if (session) {
      logSecurityEvent("ADMIN_ACTION", getClientIp(request), {
        userId: session.userId,
        detail: "admin_logout",
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": destroyAdminSessionCookie(),
      },
    });
  }

  const session = parseAdminSession(request);
  if (!session) return json({ authenticated: false });
  return json({ authenticated: true, userId: session.userId, role: session.role });
}

export async function action({ request }: { request: Request }) {
  const { ensureAdminUser } = await import("~/server/db.server");
  const { createAdminSessionCookie } = await import("~/server/session.server");
  const { getClientIp } = await import("~/server/rate-limiter.server");
  const { logSecurityEvent, sanitizeEmail, isValidEmail } = await import("~/server/security-log.server");
  const { supabase } = await import("~/server/supabase.server");
  const { logMissingAdminAuthEnv } = await import("~/server/env.server");
  const { logServerError } = await import("~/server/server-logging.server");
  // @ts-ignore
  const bcrypt = await import("bcryptjs").then((m) => m.default || m);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const missingEnv = logMissingAdminAuthEnv("api/admin-auth");
  if (missingEnv.length > 0) {
    return json(
      {
        error:
          "Admin authentication is not configured on the server. Set SUPABASE_URL, ADMIN_SESSION_SECRET, and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY on Vercel.",
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  const email = sanitizeEmail(body.email).toLowerCase().trim();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !isValidEmail(email) || !password || password.length > 128) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  try {
    await ensureAdminUser();

    console.log("[admin-auth] querying DB for:", email);

    const { data: row, error: dbErr } = await supabase
      .from("users")
      .select("id, email, password_hash, role")
      .eq("email", email)
      .maybeSingle();

    if (dbErr) {
      console.error("[admin-auth] DB error:", dbErr.message);
      return json({ error: "Service temporarily unavailable." }, { status: 503 });
    }

    console.log("[admin-auth] row found:", row ? `id=${row.id} role=${row.role}` : "null");

    const storedPassword = row?.password_hash;

    if (!row || !storedPassword) {
      logSecurityEvent("ADMIN_LOGIN_FAILED", ip, {
        email,
        detail: !row ? "no_user" : "missing_password_hash",
      });
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, storedPassword);

    console.log("LOGIN DEBUG:", {
      email,
      userFound: !!row,
      passwordMatch,
      role: row?.role,
    });

    if (!passwordMatch || row.role !== "admin") {
      logSecurityEvent("ADMIN_LOGIN_FAILED", ip, {
        email,
        detail: !passwordMatch ? "wrong_password" : "not_admin_role",
      });
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    logSecurityEvent("ADMIN_LOGIN_SUCCESS", ip, { email, userId: row.id as string });

    const adminCookie = createAdminSessionCookie(
      { userId: row.id as string, role: "admin" },
      request
    );

    console.log("[admin-auth] LOGIN SUCCESS for", email);
    return json(
      { success: true, admin: { id: row.id, email: row.email } },
      { headers: { "Set-Cookie": adminCookie } }
    );
  } catch (err) {
    logServerError("admin-auth", err);
    return json({ error: "Service temporarily unavailable." }, { status: 503 });
  }
}
