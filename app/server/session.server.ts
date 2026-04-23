/**
 * Secure cookie-based session management.
 *
 * TWO separate, isolated session cookies:
 *   __cc_session      — regular user sessions
 *   __cc_admin        — admin sessions (completely separate)
 *
 * Both use HMAC-SHA256 signing with different secrets.
 * Admin session uses a shorter lifetime (8 hours) and stricter flags.
 *
 * Cookie flags:
 *   HttpOnly  — JS cannot read it (XSS safe)
 *   SameSite=Lax — sent on same-site navigations
 *   Secure    — HTTPS-only (applied dynamically)
 */
import crypto from "node:crypto";
import { getServerEnv } from "./env.server";

// ─── Secrets ──────────────────────────────────────────────────────────────────

const USER_SECRET   = getServerEnv("SESSION_SECRET")        ?? "dev-user-secret-change-in-prod";
const ADMIN_SECRET  = getServerEnv("ADMIN_SESSION_SECRET")  ?? "dev-admin-secret-change-in-prod";

if (!getServerEnv("SESSION_SECRET")) {
  console.error("[session] SESSION_SECRET is missing. Falling back to an insecure default secret for this runtime.");
}
if (!getServerEnv("ADMIN_SESSION_SECRET")) {
  console.error("[session] ADMIN_SESSION_SECRET is missing. Falling back to an insecure default admin secret for this runtime.");
}

const USER_COOKIE   = "__cc_session";
const ADMIN_COOKIE  = "__cc_admin";

const USER_MAX_AGE  = 60 * 60 * 24 * 7;   // 7 days
const ADMIN_MAX_AGE = 60 * 60 * 8;         // 8 hours — admin sessions expire sooner

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  role: "user" | "admin";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function isHttps(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto") ?? "";
  if (proto === "https") return true;
  try { return new URL(request.url).protocol === "https:"; } catch { return false; }
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function resolveCookieDomain(request?: Request): string {
  if (!request) return "";
  try {
    const forwardedHost = (request.headers.get("x-forwarded-host") ?? "").split(",")[0]?.trim();
    const hostWithPort = forwardedHost || new URL(request.url).host;
    const hostname = hostWithPort.split(":")[0].trim().toLowerCase();
    if (!hostname) return "";
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return "";
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return "";
    return `; Domain=${hostname}`;
  } catch {
    return "";
  }
}

function buildCookie(
  name: string,
  value: string,
  maxAge: number,
  request?: Request
): string {
  const secure = (request && isHttps(request)) || isProductionRuntime() ? "; Secure" : "";
  const domain = resolveCookieDomain(request);
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${domain}${secure}`;
}

function destroyCookie(name: string, request?: Request): string {
  const secure = (request && isHttps(request)) || isProductionRuntime() ? "; Secure" : "";
  const domain = resolveCookieDomain(request);
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${domain}${secure}`;
}

function createToken(payload: SessionPayload, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig  = sign(data, secret);
  return `${data}.${sig}`;
}

function parseToken(raw: string, secret: string): SessionPayload | null {
  const lastDot = raw.lastIndexOf(".");
  if (lastDot === -1) return null;

  const data     = raw.slice(0, lastDot);
  const sig      = raw.slice(lastDot + 1);
  const expected = sign(data, secret);

  // Constant-time comparison
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf-8")) as SessionPayload;
  } catch {
    return null;
  }
}

function extractCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie") ?? "";
  const cookies = Object.fromEntries(
    header.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  return cookies[name] ?? null;
}

// ─── User Session ─────────────────────────────────────────────────────────────

export function createSessionCookie(payload: SessionPayload, request?: Request): string {
  return buildCookie(USER_COOKIE, createToken(payload, USER_SECRET), USER_MAX_AGE, request);
}

export function destroySessionCookie(request?: Request): string {
  return destroyCookie(USER_COOKIE, request);
}

export function parseSession(request: Request): SessionPayload | null {
  const raw = extractCookie(request, USER_COOKIE);
  if (!raw) return null;
  const payload = parseToken(raw, USER_SECRET);
  if (!payload) {
    console.warn("[session] User cookie signature mismatch");
    return null;
  }
  return payload;
}

export function requireSession(request: Request): SessionPayload {
  const session = parseSession(request);
  if (!session) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return session;
}

// ─── Admin Session (SEPARATE) ─────────────────────────────────────────────────

export function createAdminSessionCookie(payload: SessionPayload, request?: Request): string {
  if (payload.role !== "admin") throw new Error("Only admin payloads can use the admin cookie");
  return buildCookie(ADMIN_COOKIE, createToken(payload, ADMIN_SECRET), ADMIN_MAX_AGE, request);
}

export function destroyAdminSessionCookie(request?: Request): string {
  return destroyCookie(ADMIN_COOKIE, request);
}

export function parseAdminSession(request: Request): SessionPayload | null {
  const raw = extractCookie(request, ADMIN_COOKIE);
  if (!raw) return null;
  const payload = parseToken(raw, ADMIN_SECRET);
  if (!payload || payload.role !== "admin") {
    console.warn("[session] Admin cookie invalid or wrong role");
    return null;
  }
  return payload;
}

export function requireAdminSession(request: Request): SessionPayload {
  const session = parseAdminSession(request);
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  return session;
}

// ─── Legacy shim (used by old api.admin.ts — now checks admin cookie) ─────────
// Keep this so existing requireAdminSession calls compile without changes.
// Both now point to the same admin-cookie implementation.
