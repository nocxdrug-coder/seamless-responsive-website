/** POST /api/register — create user account */
import { supabase } from "../lib/supabase";
import { createSessionCookie } from "../lib/session";
import { hasEnv } from "../lib/env";
import bcrypt from "bcryptjs";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
}
function sanitizeEmail(v: unknown): string {
  return typeof v === "string" ? v.toLowerCase().trim().slice(0, 254) : "";
}
function isValidEmail(e: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  if (!hasEnv("SUPABASE_URL") || !hasEnv("SESSION_SECRET") || (!hasEnv("SUPABASE_SERVICE_KEY") && !hasEnv("SUPABASE_ANON_KEY")))
    return json({ error: "Registration is not configured on the server." }, { status: 503 });

  let body: { email?: unknown; name?: unknown; password?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Invalid request body" }, { status: 400 }); }

  const email    = sanitizeEmail(body.email);
  const name     = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (!email || !isValidEmail(email)) return json({ error: "Invalid email address" }, { status: 400 });
  if (!name || name.length < 2) return json({ error: "Name must be at least 2 characters" }, { status: 400 });
  if (!password || password.length < 8) return json({ error: "Password must be at least 8 characters" }, { status: 400 });
  if (password.length > 128) return json({ error: "Password too long" }, { status: 400 });

  const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (existing) return json({ error: "Email address already registered" }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const { data: user, error } = await supabase
    .from("users")
    .insert([{ email, name, password_hash: hash, role: "user", wallet_usd: 0, total_deposited_usd: 0 }])
    .select("id,email,name,role")
    .single();

  if (error) return json({ error: "Registration temporarily unavailable." }, { status: 503 });

  const cookie = createSessionCookie({ userId: user.id, role: user.role }, req);
  return json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201, headers: { "Set-Cookie": cookie } });
}
