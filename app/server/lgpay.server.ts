/**
 * LG-Pay Payment Gateway Integration
 *
 * Implements the exact signature algorithm described in the reference PHP files:
 *   1. Sort parameters by ASCII/lexicographic key order
 *   2. Format as key=value&key=value...
 *   3. Append &key=SECRET_KEY
 *   4. MD5 hash
 *   5. Convert to UPPERCASE
 *
 * All credentials are loaded from environment variables — never hardcoded.
 */
import crypto from "node:crypto";
import { getServerEnv } from "./env.server";

const APP_ID = getServerEnv("LGPAY_APP_ID") ?? "";
const SECRET_KEY = getServerEnv("LGPAY_SECRET_KEY") ?? "";
const GATEWAY_URL = "https://www.lg-pay.com/api/order/create";
const TRADE_TYPE = "INRUPI";

/** INR per 1 USD — configurable exchange rate */
const INR_PER_USD = 95;

/**
 * Generates the LG-Pay signature:
 * Sort params alphabetically → concatenate → append &key=SECRET → MD5 → UPPERCASE
 */
export function generateSignature(params: Record<string, string | number>): string {
  const sortedKeys = Object.keys(params).sort();
  const parts = sortedKeys.map((k) => `${k}=${params[k]}`);
  const raw = parts.join("&") + `&key=${SECRET_KEY}`;
  return crypto.createHash("md5").update(raw, "utf8").digest("hex").toUpperCase();
}

/**
 * Verifies a callback signature from LG-Pay.
 * Same algorithm — rebuild the signature from callback params (excluding `sign`) and compare.
 */
export function verifyCallbackSignature(params: Record<string, string>): boolean {
  if (!params.sign) return false;
  const receivedSign = params.sign.toUpperCase();

  // Build params without `sign` key
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== "sign" && v !== "") filtered[k] = v;
  }

  const expected = generateSignature(filtered);

  // Use constant-time comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(receivedSign), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Converts INR amount (whole rupees) → paise (INR * 100) as expected by LG-Pay.
 */
export function inrToPaise(inr: number): number {
  return Math.round(inr * 100);
}

/**
 * Converts INR paise to USD cents using the configured exchange rate.
 */
export function inrPaiseToUsdCents(paise: number): number {
  const inr = paise / 100;
  const usd = inr / INR_PER_USD;
  return Math.floor(usd * 100); // floor to never over-credit
}

export interface DepositCreateParams {
  orderSn: string;
  amountInr: number; // whole rupees
  notifyUrl: string;
  userIp: string;
}

export interface LgPayCreateResponse {
  status: number;
  msg: string;
  payUrl?: string;
  orderSn?: string;
}

/**
 * Calls LG-Pay to create a deposit order.
 * Returns the payment URL on success.
 */
export async function createLgPayOrder(params: DepositCreateParams): Promise<LgPayCreateResponse> {
  const paise = inrToPaise(params.amountInr);

  const payload: Record<string, string | number> = {
    app_id: APP_ID,
    trade_type: TRADE_TYPE,
    order_sn: params.orderSn,
    money: paise,
    notify_url: params.notifyUrl,
    ip: params.userIp,
  };

  const sign = generateSignature(payload);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    body.append(k, String(v));
  }
  body.append("sign", sign);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`LG-Pay HTTP error: ${res.status}`);
  }

  const data = await res.json() as { status: number; msg: string; data?: { pay_url: string; order_sn: string } };

  return {
    status: data.status,
    msg: data.msg,
    payUrl: data.data?.pay_url,
    orderSn: data.data?.order_sn,
  };
}

export { INR_PER_USD };
