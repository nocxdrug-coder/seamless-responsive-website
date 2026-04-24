/** GET /api/user — current user profile + wallet + recent activity */
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
    if (!session) return json({ user: null }, { status: 401 });

    const [userRes, depositRes, txRes] = await Promise.all([
      supabase.from("users").select("id,email,name,role,wallet_usd,total_deposited_usd").eq("id", session.userId).maybeSingle(),
      supabase.from("deposits").select("id,order_sn,amount_inr_paise,amount_usd_cents,status,created_at").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("transactions").select("id,type,amount_usd_cents,balance_after_cents,description,created_at").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(50),
    ]);

    const user = userRes.data;
    if (!user) return json({ error: "User not found" }, { status: 404 });

    const walletUsd = Number(user.wallet_usd);
    return json({
      id: user.id, email: user.email, name: user.name, role: user.role,
      walletUsd, walletDisplay: (walletUsd / 100).toFixed(2),
      totalDepositedUsd: user.total_deposited_usd,
      totalDepositedDisplay: (Number(user.total_deposited_usd) / 100).toFixed(2),
      deposits: (depositRes.data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id, orderSn: d.order_sn,
        amountInr: Number(d.amount_inr_paise) / 100,
        amountUsd: (Number(d.amount_usd_cents) / 100).toFixed(2),
        status: d.status, createdAt: d.created_at,
      })),
      transactions: (txRes.data ?? []).map((t: Record<string, unknown>) => ({
        id: t.id, type: t.type,
        amount: (Number(t.amount_usd_cents) / 100).toFixed(2),
        balanceAfter: (Number(t.balance_after_cents) / 100).toFixed(2),
        description: t.description, createdAt: t.created_at,
      })),
    });
  } catch (err) {
    console.error("[api/user]", err);
    return json({ user: null }, { status: 401 });
  }
}
