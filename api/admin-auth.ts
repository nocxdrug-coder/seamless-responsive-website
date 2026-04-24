/** GET  /api/admin-auth — check admin session or ?action=logout
 *  POST /api/admin-auth — admin login */
import { supabase } from "../lib/supabase";
import { parseAdminSession, createAdminSessionCookie, destroyAdminSessionCookie } from "../lib/session";
import { hasEnv } from "../lib/env";
import bcrypt from "bcryptjs";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "logout") {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", "Set-Cookie": destroyAdminSessionCookie(req) },
      });
    }
    const session = parseAdminSession(req);
    if (!session) return json({ authenticated: false });
    return json({ authenticated: true, userId: session.userId, role: session.role });
  }

  if (!hasEnv("SUPABASE_URL") || !hasEnv("ADMIN_SESSION_SECRET") || (!hasEnv("SUPABASE_SERVICE_KEY") && !hasEnv("SUPABASE_ANON_KEY")))
    return json({ error: "Admin authentication is not configured on the server." }, { status: 503 });

  let body: { email?: unknown; password?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Invalid credentials" }, { status: 401 }); }

  const email    = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password || password.length > 128) return json({ error: "Invalid credentials" }, { status: 401 });

  const { data: row, error: dbErr } = await supabase.from("users")
    .select("id,email,password_hash,role").eq("email", email).maybeSingle();

  if (dbErr) return json({ error: "Service temporarily unavailable." }, { status: 503 });
  if (!row?.password_hash) return json({ error: "Invalid credentials" }, { status: 401 });

  const match = await bcrypt.compare(password, row.password_hash);
  if (!match || row.role !== "admin") return json({ error: "Invalid credentials" }, { status: 401 });

  const cookie = createAdminSessionCookie({ userId: row.id as string, role: "admin" }, req);
  return json({ success: true, admin: { id: row.id, email: row.email } }, { headers: { "Set-Cookie": cookie } });
}
