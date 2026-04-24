/** POST /api/reset-password — password recovery via identity verification */
import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  const body = await req.json();
  const email         = body.email?.toLowerCase().trim();
  const name          = body.name?.trim();
  const createdDate   = body.createdDate;
  const walletBalance = Number(body.walletBalance);
  const totalPurchases = Number(body.totalPurchases);
  const newPassword   = body.newPassword;

  if (!email || !name || !createdDate || isNaN(walletBalance) || isNaN(totalPurchases) || !newPassword)
    return json({ error: "Missing required fields." }, { status: 400 });
  if (newPassword.length < 8)
    return json({ error: "Password must be at least 8 characters long." }, { status: 400 });

  const { data: user } = await supabase.from("users").select("id,email,name,created_at,wallet_usd").eq("email", email).maybeSingle();
  if (!user) return json({ error: "Recovery failed. Your details did not match our records." }, { status: 401 });

  let failed = false;
  if (user.name.toLowerCase() !== name.toLowerCase()) failed = true;
  const dbDateStr = new Date(Number(user.created_at)).toISOString().split("T")[0];
  if (dbDateStr !== createdDate) failed = true;
  if (Number(user.wallet_usd) !== walletBalance * 100) failed = true;

  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if (count !== totalPurchases) failed = true;

  if (failed) return json({ error: "Recovery failed. Your details did not match our records." }, { status: 401 });

  const hash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase.from("users").update({ password_hash: hash }).eq("id", user.id);
  if (error) return json({ error: "Database error during reset." }, { status: 500 });

  return json({ success: true });
}
