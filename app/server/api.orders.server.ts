/**
 * GET /api/orders
 * Returns the current user's order history with card details for completed orders.
 *
 * Query params:
 *   - limit  → default 30, max 100
 *
 * PERFORMANCE: parallel product batch-fetch, timing log, Cache-Control 10s.
 */
import { getUserOrders, getProductById, ensureSeeded } from "~/server/db.server";
import { requireSession } from "~/server/session.server";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=10",
      ...(init?.headers ?? {}),
    },
  });
}

export async function loader({ request }: { request: Request }) {
  const t0 = Date.now();
  await ensureSeeded();
  let session;
  try {
    session = requireSession(request);
  } catch (res) {
    return res as Response;
  }

  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "30")));

  const orders = await getUserOrders(session.userId, limit);

  // Batch-fetch unique products in parallel (avoids N DB calls)
  const uniqueProductIds = [...new Set(orders.map((o) => o.productId))];
  const productResults   = await Promise.all(uniqueProductIds.map((id) => getProductById(id)));
  const productMap       = new Map(productResults.filter(Boolean).map((p) => [p!.id, p!]));

  const enriched = orders.map((order) => {
    const product = productMap.get(order.productId);
    return {
      id: order.id,
      status: order.status,
      amountUsd: (order.amountUsdCents / 100).toFixed(2),
      createdAt: order.createdAt,
      product: product
        ? {
            id: product.id,
            name: product.name,
            provider: product.provider,
            type: product.type,
            country: product.country,
            countryFlag: product.countryFlag,
            bank: product.bank,
          }
        : null,
      cardDetails: order.status === "completed" ? order.cardDetails : null,
    };
  });

  console.log(`[api/orders] ${Date.now() - t0}ms user=${session.userId} count=${enriched.length}`);
  return json({ orders: enriched });
}
