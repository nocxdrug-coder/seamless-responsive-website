/** POST /api/register — create user account */
import { supabase } from "../lib/supabase";
import { createSessionCookie } from "../lib/session";
import { hasEnv } from "../lib/env";
import bcrypt from "bcryptjs";

function buildWebReq(nodeReq: any): Request {
  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers || {})) {
    if (v !== undefined) headers.append(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  return new Request(nodeReq.url, { method: nodeReq.method, headers });
}
function sanitizeEmail(v: unknown): string {
  return typeof v === "string" ? v.toLowerCase().trim().slice(0, 254) : "";
}
function isValidEmail(e: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default async function handler(req: any, res: any): Promise<void> {
  console.log("API HIT: /api/register", req.method);

  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  if (!hasEnv("SUPABASE_URL") || !hasEnv("SESSION_SECRET") || (!hasEnv("SUPABASE_SERVICE_KEY") && !hasEnv("SUPABASE_ANON_KEY"))) {
    res.status(503).json({ error: "Registration is not configured on the server." }); return;
  }

  const { email, name, password } = req.body || {};
  const cleanEmail    = sanitizeEmail(email);
  const cleanName     = typeof name === "string" ? name.trim().slice(0, 80) : "";
  const cleanPassword = typeof password === "string" ? password.trim() : "";

  if (!cleanEmail || !isValidEmail(cleanEmail)) { res.status(400).json({ error: "Invalid email address" }); return; }
  if (!cleanName || cleanName.length < 2) { res.status(400).json({ error: "Name must be at least 2 characters" }); return; }
  if (!cleanPassword || cleanPassword.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters" }); return; }
  if (cleanPassword.length > 128) { res.status(400).json({ error: "Password too long" }); return; }

  const { data: existing } = await supabase.from("users").select("id").eq("email", cleanEmail).maybeSingle();
  if (existing) { res.status(409).json({ error: "Email address already registered" }); return; }

  const hash = await bcrypt.hash(cleanPassword, 10);
  const { data: user, error } = await supabase
    .from("users")
    .insert([{ email: cleanEmail, name: cleanName, password_hash: hash, role: "user", wallet_usd: 0, total_deposited_usd: 0 }])
    .select("id,email,name,role")
    .single();

  if (error) { res.status(503).json({ error: "Registration temporarily unavailable." }); return; }

  const cookie = createSessionCookie({ userId: user.id, role: user.role }, buildWebReq(req));
  res.setHeader("Set-Cookie", cookie);
  res.status(201).json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
