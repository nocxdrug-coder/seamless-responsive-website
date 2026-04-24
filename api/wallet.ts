/** GET /api/wallet — user wallet balance */
import { supabase } from "../lib/supabase";
import { parseSession } from "../lib/session";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store", ...(init?.headers ?? {}) },
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const session = parseSession(req);
    if (!session) return json({ error: "Unauthorized" }, { status: 401 });

    const [userRes, walletRes] = await Promise.all([
      supabase.from("users").select("id,email,name,role,total_deposited_usd").eq("id", session.userId).maybeSingle(),
      supabase.from("users").select("wallet_usd").eq("id", session.userId).maybeSingle(),
    ]);

    const user = userRes.data;
    const walletUsd = Number(walletRes.data?.wallet_usd ?? 0);
    if (!user) return json({ error: "User not found" }, { status: 404 });

    return json({
      id: user.id, email: user.email, name: user.name, role: user.role,
      walletUsd, walletDisplay: (walletUsd / 100).toFixed(2),
      totalDepositedUsd: user.total_deposited_usd,
      totalDepositedDisplay: (Number(user.total_deposited_usd) / 100).toFixed(2),
    });
  } catch (err) {
    console.error("[api/wallet]", err);
    return json({ error: "Unauthorized" }, { status: 401 });
  }
}
