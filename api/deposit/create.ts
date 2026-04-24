/** POST /api/deposit/create — initiate UPI deposit via LG-Pay */
import crypto from "node:crypto";
import { supabase } from "../../lib/supabase";
import { parseSession } from "../../lib/session";
import { createLgPayOrder, inrToPaise, inrPaiseToUsdCents } from "../../lib/lgpay";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
}

const MIN_INR = 2000;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  const session = parseSession(req);
  if (!session) return json({ error: "Unauthorized — please log in" }, { status: 401 });

  const { data: user } = await supabase.from("users").select("id").eq("id", session.userId).maybeSingle();
  if (!user) return json({ error: "User not found" }, { status: 404 });

  let body: { amountInr?: number };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, { status: 400 }); }

  const amountInr = Number(body.amountInr);
  if (!Number.isFinite(amountInr) || amountInr < MIN_INR)
    return json({ error: `Minimum deposit amount is ${MIN_INR} INR` }, { status: 400 });

  const orderSn   = `CC${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const origin    = new URL(req.url).origin;
  const notifyUrl = `${origin}/api/deposit/callback`;
  const userIp    = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";

  let payUrl: string | undefined;
  let gatewayError: string | null = null;
  try {
    const lg = await createLgPayOrder({ orderSn, amountInr, notifyUrl, userIp });
    if (lg.status === 1 && lg.payUrl) payUrl = lg.payUrl;
    else gatewayError = lg.msg || "Payment gateway error";
  } catch (err) {
    gatewayError = "Could not connect to payment gateway. Please try again.";
  }

  const paise    = inrToPaise(amountInr);
  const usdCents = inrPaiseToUsdCents(paise);
  const { data: deposit } = await supabase
    .from("deposits")
    .insert([{ user_id: session.userId, order_sn: orderSn, amount_inr_paise: paise, amount_usd_cents: usdCents, status: "pending" }])
    .select("id").single();

  if (gatewayError || !payUrl)
    return json({ error: gatewayError ?? "No payment URL returned", depositId: deposit?.id, orderSn }, { status: 502 });

  return json({ success: true, depositId: deposit?.id, orderSn, payUrl, amountInr, amountUsd: (usdCents / 100).toFixed(2) });
}
