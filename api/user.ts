/** GET /api/user — current user profile + wallet + recent activity */
import { supabase } from "../lib/supabase";
import { parseSession } from "../lib/session";

function buildWebReq(nodeReq: any): Request {
  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers || {})) {
    if (v !== undefined) headers.append(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  return new Request(nodeReq.url, { method: nodeReq.method, headers });
}

function sendJson(res: any, data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  res.status(status).json(data);
}

export default async function handler(req: any, res: any): Promise<void> {
  try {
    const session = parseSession(buildWebReq(req));
    if (!session) { res.status(401).json({ user: null }); return; }

    const [userRes, depositRes, txRes] = await Promise.all([
      supabase.from("users").select("id,email,name,role,wallet_usd,total_deposited_usd").eq("id", session.userId).maybeSingle(),
      supabase.from("deposits").select("id,order_sn,amount_inr_paise,amount_usd_cents,status,created_at").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("transactions").select("id,type,amount_usd_cents,balance_after_cents,description,created_at").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(50),
    ]);

    const user = userRes.data;
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const walletUsd = Number(user.wallet_usd);
    res.status(200).json({
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
    res.status(401).json({ user: null });
  }
}
