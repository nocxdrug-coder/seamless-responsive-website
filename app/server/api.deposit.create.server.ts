/**
 * POST /api/deposit/create
 * Initiates a UPI deposit via LG-Pay gateway.
 *
 * Flow:
 *   1. Authenticate user via session cookie
 *   2. Validate amount (minimum 2000 INR)
 *   3. Generate a unique order_sn
 *   4. Call LG-Pay API with signed payload
 *   5. Persist the deposit record (for audit trail)
 *   6. Return payment URL to frontend
 */
import crypto from "node:crypto";
import { findUserById, createDeposit, ensureSeeded } from "~/server/db.server";
import { parseSession } from "~/server/session.server";
import { createLgPayOrder, inrToPaise, inrPaiseToUsdCents } from "~/server/lgpay.server";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

const MIN_INR = 2000;

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  await ensureSeeded();

  // --- Auth: parse session cookie ---
  // The frontend must send fetch(..., { credentials: "include" }) so the
  // browser includes the HttpOnly cookie in the request.
  const cookieHeader = request.headers.get("Cookie");
  console.log(`[deposit/create] Incoming cookie header: ${cookieHeader ? cookieHeader.substring(0, 120) : "(none)"}`);

  const session = parseSession(request);
  if (!session) {
    console.warn("[deposit/create] Session parse failed — returning 401");
    return json({ error: "Unauthorized — please log in" }, { status: 401 });
  }

  console.log(`[deposit/create] Authenticated userId=${session.userId}`);

  const user = await findUserById(session.userId);
  if (!user) {
    console.warn(`[deposit/create] userId=${session.userId} not found in DB`);
    return json({ error: "User not found" }, { status: 404 });
  }

  // --- Parse & validate body ---
  let body: { amountInr?: number };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amountInr = Number(body.amountInr);
  if (!Number.isFinite(amountInr) || amountInr < MIN_INR) {
    return json({ error: `Minimum deposit amount is ${MIN_INR} INR` }, { status: 400 });
  }

  // --- Generate unique order serial number ---
  const orderSn = `CC${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // --- Build callback URL dynamically from request origin ---
  const origin = new URL(request.url).origin;
  const notifyUrl = `${origin}/api/deposit/callback`;

  // --- Extract user's real IP (works behind proxies) ---
  const userIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  console.log(`[deposit/create] orderSn=${orderSn} amountInr=${amountInr} notifyUrl=${notifyUrl}`);

  let payUrl: string | undefined;
  let gatewayError: string | null = null;

  try {
    const lgResponse = await createLgPayOrder({
      orderSn,
      amountInr,
      notifyUrl,
      userIp,
    });

    console.log(`[deposit/create] LG-Pay response:`, JSON.stringify(lgResponse));

    if (lgResponse.status === 1 && lgResponse.payUrl) {
      payUrl = lgResponse.payUrl;
    } else {
      gatewayError = lgResponse.msg || "Payment gateway error";
    }
  } catch (err) {
    console.error("[deposit/create] LG-Pay create order failed:", err);
    gatewayError = "Could not connect to payment gateway. Please try again.";
  }

  // --- Persist deposit for audit trail (regardless of gateway result) ---
  const paise = inrToPaise(amountInr);
  const usdCents = inrPaiseToUsdCents(paise);
  const deposit = await createDeposit(session.userId, orderSn, paise, usdCents);

  if (gatewayError || !payUrl) {
    return json(
      {
        error: gatewayError ?? "No payment URL returned by gateway",
        depositId: deposit.id,
        orderSn,
      },
      { status: 502 }
    );
  }

  console.log(`[deposit/create] Success! payUrl=${payUrl}`);

  return json({
    success: true,
    depositId: deposit.id,
    orderSn,
    payUrl,
    amountInr,
    amountUsd: (usdCents / 100).toFixed(2),
  });
}
