/** LG-Pay utility for Vercel API functions — no .server. imports */
import crypto from "node:crypto";
import { getEnv } from "./env";

const APP_ID     = getEnv("LGPAY_APP_ID")     ?? "";
const SECRET_KEY = getEnv("LGPAY_SECRET_KEY") ?? "";
const GATEWAY_URL = "https://www.lg-pay.com/api/order/create";
const INR_PER_USD = 95;

export function inrToPaise(inr: number): number { return Math.round(inr * 100); }
export function inrPaiseToUsdCents(paise: number): number { return Math.floor((paise / 100 / INR_PER_USD) * 100); }

export function generateSignature(params: Record<string, string | number>): string {
  const parts = Object.keys(params).sort().map(k => `${k}=${params[k]}`);
  const raw = parts.join("&") + `&key=${SECRET_KEY}`;
  return crypto.createHash("md5").update(raw, "utf8").digest("hex").toUpperCase();
}

export function verifyCallbackSignature(params: Record<string, string>): boolean {
  if (!params.sign) return false;
  const received = params.sign.toUpperCase();
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) { if (k !== "sign" && v !== "") filtered[k] = v; }
  const expected = generateSignature(filtered);
  try { return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected)); } catch { return false; }
}

export async function createLgPayOrder(params: { orderSn: string; amountInr: number; notifyUrl: string; userIp: string }) {
  const paise = inrToPaise(params.amountInr);
  const payload: Record<string, string | number> = {
    app_id: APP_ID, trade_type: "INRUPI", order_sn: params.orderSn,
    money: paise, notify_url: params.notifyUrl, ip: params.userIp,
  };
  const sign = generateSignature(payload);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) body.append(k, String(v));
  body.append("sign", sign);
  const res = await fetch(GATEWAY_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
  if (!res.ok) throw new Error(`LG-Pay HTTP error: ${res.status}`);
  const data = await res.json() as { status: number; msg: string; data?: { pay_url: string; order_sn: string } };
  return { status: data.status, msg: data.msg, payUrl: data.data?.pay_url, orderSn: data.data?.order_sn };
}
