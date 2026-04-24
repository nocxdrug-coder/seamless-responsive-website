/** HMAC-signed session cookies for Vercel API functions. No .server. imports. */
import crypto from "node:crypto";
import { getEnv } from "./env";

export interface SessionPayload { userId: string; role: "user" | "admin"; }

const USER_SECRET  = getEnv("SESSION_SECRET")         ?? "dev-user-secret-change-in-prod";
const ADMIN_SECRET = getEnv("ADMIN_SESSION_SECRET")   ?? "dev-admin-secret-change-in-prod";
const USER_COOKIE  = "__cc_session";
const ADMIN_COOKIE = "__cc_admin";
const USER_MAX_AGE  = 60 * 60 * 24 * 7; // 7 days
const ADMIN_MAX_AGE = 60 * 60 * 8;       // 8 hours

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}
function isHttps(req: Request): boolean {
  return req.headers.get("x-forwarded-proto") === "https" ||
    (() => { try { return new URL(req.url).protocol === "https:"; } catch { return false; } })();
}
function isProd(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}
function domain(req?: Request): string {
  if (!req) return "";
  try {
    const host = (req.headers.get("x-forwarded-host") ?? "").split(",")[0]?.trim() || new URL(req.url).host;
    const h = host.split(":")[0].trim().toLowerCase();
    if (!h || h === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return "";
    return `; Domain=${h}`;
  } catch { return ""; }
}
function buildCookie(name: string, value: string, maxAge: number, req?: Request): string {
  const secure = ((req && isHttps(req)) || isProd()) ? "; Secure" : "";
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${domain(req)}${secure}`;
}
function destroyCookie(name: string, req?: Request): string {
  const secure = ((req && isHttps(req)) || isProd()) ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${domain(req)}${secure}`;
}
function makeToken(p: SessionPayload, secret: string): string {
  const data = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}
function parseToken(raw: string, secret: string): SessionPayload | null {
  const i = raw.lastIndexOf(".");
  if (i === -1) return null;
  const data = raw.slice(0, i), sig = raw.slice(i + 1);
  const exp = Buffer.from(sign(data, secret));
  const got = Buffer.from(sig);
  if (exp.length !== got.length || !crypto.timingSafeEqual(exp, got)) return null;
  try { return JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload; } catch { return null; }
}
function getCookie(req: Request, name: string): string | null {
  const h = req.headers.get("Cookie") ?? "";
  const map = Object.fromEntries(h.split(";").map(c => { const [k, ...v] = c.trim().split("="); return [k, v.join("=")]; }));
  return map[name] ?? null;
}

// User session
export function createSessionCookie(p: SessionPayload, req?: Request) { return buildCookie(USER_COOKIE, makeToken(p, USER_SECRET), USER_MAX_AGE, req); }
export function destroySessionCookie(req?: Request) { return destroyCookie(USER_COOKIE, req); }
export function parseSession(req: Request): SessionPayload | null {
  const raw = getCookie(req, USER_COOKIE);
  if (!raw) return null;
  return parseToken(raw, USER_SECRET);
}
export function requireSession(req: Request): SessionPayload {
  const s = parseSession(req);
  if (!s) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return s;
}

// Admin session
export function createAdminSessionCookie(p: SessionPayload, req?: Request) { return buildCookie(ADMIN_COOKIE, makeToken(p, ADMIN_SECRET), ADMIN_MAX_AGE, req); }
export function destroyAdminSessionCookie(req?: Request) { return destroyCookie(ADMIN_COOKIE, req); }
export function parseAdminSession(req: Request): SessionPayload | null {
  const raw = getCookie(req, ADMIN_COOKIE);
  if (!raw) return null;
  const p = parseToken(raw, ADMIN_SECRET);
  return (p?.role === "admin") ? p : null;
}
export function requireAdminSession(req: Request): SessionPayload {
  const s = parseAdminSession(req);
  if (!s) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return s;
}
