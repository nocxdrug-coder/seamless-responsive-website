/** POST /api/deposit/callback — LG-Pay payment webhook
 *  GET  /api/deposit/callback — LG-Pay gateway ping */
import { supabase } from "../../lib/supabase";
import { verifyCallbackSignature } from "../../lib/lgpay";

const OK = new Response("ok", { status: 200, headers: { "Content-Type": "text/plain" } });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return OK; // GET ping — just reply "ok"

  let params: Record<string, string>;
  try {
    const text = await req.text();
    params = Object.fromEntries(new URLSearchParams(text).entries());
  } catch { return OK; }

  const { order_sn, status, sign, money } = params;
  if (!order_sn || !status || !sign) return OK;

  if (!verifyCallbackSignature(params)) {
    console.error("[callback] Invalid signature for order:", order_sn);
    return OK;
  }

  // Duplicate prevention
  const { data: already } = await supabase.from("processed_callbacks").select("id").eq("order_sn", order_sn).maybeSingle();
  if (already) return OK;

  const { data: deposit } = await supabase.from("deposits").select("id,user_id,status,amount_usd_cents").eq("order_sn", order_sn).maybeSingle();
  if (!deposit || deposit.status !== "pending") return OK;

  if (status === "1") {
    await supabase.from("processed_callbacks").insert([{ order_sn }]);
    await supabase.from("deposits").update({ status: "completed" }).eq("id", deposit.id);
    const { data: u } = await supabase.from("users").select("wallet_usd").eq("id", deposit.user_id).maybeSingle();
    const newBalance = Number(u?.wallet_usd ?? 0) + Number(deposit.amount_usd_cents);
    await supabase.from("users").update({ wallet_usd: newBalance, total_deposited_usd: newBalance }).eq("id", deposit.user_id);
    await supabase.from("transactions").insert([{
      user_id: deposit.user_id, type: "deposit",
      amount_usd_cents: deposit.amount_usd_cents, balance_after_cents: newBalance,
      description: `Deposit (${order_sn}) INR: ${money ?? "?"}`,
    }]);
    console.log(`[callback] SUCCESS order=${order_sn} user=${deposit.user_id}`);
  } else {
    await supabase.from("processed_callbacks").insert([{ order_sn }]);
    await supabase.from("deposits").update({ status: "failed" }).eq("id", deposit.id);
  }

  return OK;
}
