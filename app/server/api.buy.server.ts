/**
 * POST /api/buy
 * Purchases a card from the catalog.
 *
 * Flow:
 *   1. Authenticate user via session cookie
 *   2. Validate product availability
 *   3. Check wallet balance
 *   4. Atomically decrement stock (prevents double-sell race)
 *   5. Deduct wallet
 *   6. Create completed order with card details
 *   7. Record transaction
 *
 * Double-purchase prevention: decrement uses a compare-and-swap on stock
 * within a single Node.js process. For multi-process deployments, replace
 * with a DB-level SELECT ... FOR UPDATE transaction.
 */
import {
  findUserById,
  getProductById,
  decrementProductStockAfterPurchase,
  createOrder,
  completeOrder,
  adjustWallet,
  ensureSeeded,
  getWalletBalance,
} from "~/server/db.server";
import { parseSession } from "~/server/session.server";
import { getClientIp, isIpBanned, logIpActivity, bannedResponse } from "~/server/ip-security.server";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  await ensureSeeded();

  // ── IP ban check ───────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  if (await isIpBanned(ip)) {
    logIpActivity(request, { action: "purchase", status: "blocked" });
    return bannedResponse();
  }

  const session = parseSession(request);
  if (!session) return json({ error: "Unauthorized" }, { status: 401 });

  console.log("USER [purchase]:", session.userId);

  let body: { productId?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId } = body;
  if (!productId || typeof productId !== "string") {
    return json({ error: "productId is required" }, { status: 400 });
  }

  // 1. Fetch user
  const user = await findUserById(session.userId);
  if (!user) return json({ error: "User not found" }, { status: 404 });

  // 2. Fetch product
  const product = await getProductById(productId);
  if (!product) return json({ error: "Product not found" }, { status: 404 });
  // product.status is mapped by rowToProduct: DB 'active' → app 'in_stock'
  if (product.status !== "in_stock" || product.stock <= 0) {
    return json({ error: "This card is no longer available" }, { status: 409 });
  }

  // 3. Check balance — users.wallet_usd is the single source of truth (always in sync).
  const effectiveBalance = await getWalletBalance(session.userId);

  console.log("WALLET [purchase]:", effectiveBalance);

  if (effectiveBalance < product.priceUsdCents) {
    return json(
      {
        error: "Insufficient wallet balance",
        required: (product.priceUsdCents / 100).toFixed(2),
        available: (effectiveBalance / 100).toFixed(2),
      },
      { status: 402 }
    );
  }

  // 4. Atomically decrement stock — compare-and-swap on current stock value
  const sold = await decrementProductStockAfterPurchase(productId);
  if (!sold) {
    return json({ error: "This card was just purchased by another user" }, { status: 409 });
  }

  // 5. Create pending order
  const order = await createOrder(session.userId, productId, product.priceUsdCents);

  // 6. Deduct wallet
  await adjustWallet(
    session.userId,
    -product.priceUsdCents,
    "purchase",
    `Purchase: ${product.provider} ${product.type} \u2013 ${product.country}`,
    order.id
  );

  // 7. Complete order with card details
  const cardDetails = {
    cardNumber: product.cardNumber ?? "N/A",
    cvv: product.cvv ?? "N/A",
    expiry: product.expiry,
    fullName: product.fullName ?? "N/A",
    bin: product.bin,
    bank: product.bank,
  };
  await completeOrder(order.id, cardDetails);
  logIpActivity(request, { userId: session.userId, action: "purchase", status: "success" });

  return json({
    success: true,
    orderId: order.id,
    message: "Purchase successful",
    card: {
      cardNumber: cardDetails.cardNumber,
      cvv: cardDetails.cvv,
      expiry: cardDetails.expiry,
      fullName: cardDetails.fullName,
      bin: cardDetails.bin,
      bank: cardDetails.bank,
      provider: product.provider,
      country: product.country,
      countryFlag: product.countryFlag,
    },
    newBalance: ((effectiveBalance - product.priceUsdCents) / 100).toFixed(2),
  });
}
