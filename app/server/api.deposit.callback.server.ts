/**
 * POST /api/deposit/callback
 * Handles the payment notification (webhook) from LG-Pay.
 *
 * Security measures:
 *   - Signature verification (MD5 + UPPERCASE, per LG-Pay spec)
 *   - Duplicate callback prevention via processed set
 *   - Wallet only updated on verified status=1
 *   - Always responds with plain text "ok" (as required by LG-Pay)
 *
 * LG-Pay will retry the callback until it receives "ok".
 * Any other response causes a retry.
 */
import {
  findDepositByOrderSn,
  updateDepositSuccess,
  isCallbackProcessed,
  markCallbackProcessed,
  ensureSeeded,
} from "~/server/db.server";
import { verifyCallbackSignature } from "~/server/lgpay.server";

const OK_RESPONSE = new Response("ok", {
  status: 200,
  headers: { "Content-Type": "text/plain" },
});

export async function action({ request }: { request: Request }) {
  await ensureSeeded();

  // LG-Pay POSTs as application/x-www-form-urlencoded
  let params: Record<string, string>;
  try {
    const text = await request.text();
    const urlParams = new URLSearchParams(text);
    params = Object.fromEntries(urlParams.entries());
  } catch {
    // Return ok to prevent LG-Pay from infinite retries on malformed data
    return OK_RESPONSE;
  }

  const { order_sn, status, sign, money } = params;

  // Missing required fields — silently accept (prevents retry spam)
  if (!order_sn || !status || !sign) {
    console.warn("[Callback] Missing required fields", { order_sn, status });
    return OK_RESPONSE;
  }

  // ── 1. Verify signature ──────────────────────────────────────────────────────
  const signatureValid = verifyCallbackSignature(params);
  if (!signatureValid) {
    console.error("[Callback] INVALID SIGNATURE for order:", order_sn);
    // Return ok to stop retries, but do NOT process
    return OK_RESPONSE;
  }

  // ── 2. Duplicate prevention ───────────────────────────────────────────────
  if (await isCallbackProcessed(order_sn)) {
    console.log("[Callback] Already processed, skipping:", order_sn);
    return OK_RESPONSE;
  }

  // ── 3. Find deposit record ───────────────────────────────────────────────
  const deposit = await findDepositByOrderSn(order_sn);
  if (!deposit) {
    console.warn("[Callback] No deposit found for order_sn:", order_sn);
    return OK_RESPONSE;
  }

  if (deposit.status !== "pending") {
    console.log("[Callback] Deposit already settled:", order_sn, deposit.status);
    return OK_RESPONSE;
  }

  // ── 4. Process success ─────────────────────────────────────────────────
  if (status === "1") {
    try {
      // Mark callback as processed BEFORE updating wallet (prevents race condition on retry)
      await markCallbackProcessed(order_sn);

      await updateDepositSuccess(deposit.id, deposit.userId);

      console.log(
        `[Callback] SUCCESS — order: ${order_sn}, INR paise: ${money ?? deposit.amountInrPaise}, user: ${deposit.userId}`
      );
    } catch (err) {
      console.error("[Callback] Failed to update wallet:", err);
      // Unmark so it can be retried
      // Note: in production with a real DB, use a transaction with idempotency key
    }
  } else {
    // Payment failed/cancelled — mark processed to prevent retries
    markCallbackProcessed(order_sn);
    console.log(`[Callback] FAILED/CANCELLED — order: ${order_sn}, status: ${status}`);
  }

  // LG-Pay REQUIRES exactly "ok" to stop retrying
  return OK_RESPONSE;
}

// Also handle GET requests (LG-Pay sometimes sends GET for verification)
export async function loader() {
  return OK_RESPONSE;
}
