/** GET  /api/god-bypass — load locked accounts (requires ?t=BYPASS_SECRET)
 *  POST /api/god-bypass — unlock account by email */
import { supabase } from "../lib/supabase";
import { parseAdminSession } from "../lib/session";
import { getEnv } from "../lib/env";

function isValidToken(t: string): boolean {
  const secret = getEnv("BYPASS_SECRET") ?? "";
  return secret.length > 0 && t === secret;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") {
    const token = new URL(req.url).searchParams.get("t") ?? "";
    if (!isValidToken(token)) return Response.json({ authorized: false, token: "", adminId: null, lockedAccounts: [] });

    const admin = parseAdminSession(req);
    if (!admin) return Response.json({ authorized: false, token, adminId: null, lockedAccounts: [], needsAdminLogin: true });

    const { data } = await supabase.from("users")
      .select("id,email,failed_attempts,locked_until")
      .not("locked_until", "is", null)
      .gt("locked_until", Date.now());

    const accounts = (data ?? []).map((u: Record<string, unknown>) => ({
      id: u.id, email: u.email,
      failedAttempts: u.failed_attempts,
      lockedUntil: u.locked_until,
      remainingMs: Math.max(0, Number(u.locked_until) - Date.now()),
    }));

    return Response.json({ authorized: true, token, adminId: admin.userId, lockedAccounts: accounts, needsAdminLogin: false });
  }

  if (req.method === "POST") {
    const form  = await req.formData();
    const token = (form.get("token") as string) ?? "";
    const email = (form.get("email") as string) ?? "";

    if (!isValidToken(token)) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const admin = parseAdminSession(req);
    if (!admin) return Response.json({ ok: false, error: "Admin session required" }, { status: 403 });

    if (!email.trim()) return Response.json({ ok: false, error: "Email is required" }, { status: 400 });

    const { data: user } = await supabase.from("users").select("id,email").eq("email", email.toLowerCase().trim()).maybeSingle();
    if (!user) return Response.json({ ok: false, error: `No user found with email: ${email}` });

    await supabase.from("users").update({ failed_attempts: 0, locked_until: null }).eq("id", user.id);
    return Response.json({ ok: true, message: `✓ Account ${user.email} has been unlocked.` });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
