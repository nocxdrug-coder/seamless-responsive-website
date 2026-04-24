/** GET  /api/admin-auth — check admin session or ?action=logout
 *  POST /api/admin-auth — admin login */
import { supabase } from "../lib/supabase";
import { parseAdminSession, createAdminSessionCookie, destroyAdminSessionCookie } from "../lib/session";
import { hasEnv } from "../lib/env";
import bcrypt from "bcryptjs";

function buildWebReq(nodeReq: any): Request {
  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers || {})) {
    if (v !== undefined) headers.append(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  return new Request(nodeReq.url, { method: nodeReq.method, headers });
}

export default async function handler(req: any, res: any): Promise<void> {
  console.log("API HIT: /api/admin-auth", req.method);

  if (req.method !== "POST") {
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "logout") {
      const cookie = destroyAdminSessionCookie(buildWebReq(req));
      res.setHeader("Set-Cookie", cookie);
      return res.status(200).json({ success: true });
    }
    const session = parseAdminSession(buildWebReq(req));
    if (!session) return res.status(200).json({ authenticated: false });
    return res.status(200).json({ authenticated: true, userId: session.userId, role: session.role });
  }

  if (!hasEnv("SUPABASE_URL") || !hasEnv("ADMIN_SESSION_SECRET") || (!hasEnv("SUPABASE_SERVICE_KEY") && !hasEnv("SUPABASE_ANON_KEY"))) {
    return res.status(503).json({ error: "Admin authentication is not configured on the server." });
  }

  const { email, password } = req.body || {};
  const cleanEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  const cleanPassword = typeof password === "string" ? password : "";

  if (!cleanEmail || !cleanPassword || cleanPassword.length > 128) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { data: row, error: dbErr } = await supabase.from("users")
    .select("id,email,password_hash,role").eq("email", cleanEmail).maybeSingle();

  if (dbErr) return res.status(503).json({ error: "Service temporarily unavailable." });
  if (!row?.password_hash) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(cleanPassword, row.password_hash);
  if (!match || row.role !== "admin") return res.status(401).json({ error: "Invalid credentials" });

  const cookie = createAdminSessionCookie({ userId: row.id as string, role: "admin" }, buildWebReq(req));
  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ success: true, admin: { id: row.id, email: row.email } });
}
