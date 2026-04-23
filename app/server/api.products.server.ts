/**
 * GET /api/products
 * Public catalog feed for the Shop + 100% Valid UI.
 *
 * Query params:
 *   - valid=1  → only products flagged is_100_valid=true
 *
 * PERFORMANCE: 30-second Cache-Control — product catalog rarely changes
 * mid-session, so we avoid hitting Supabase on every page render.
 */

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      ...(init?.headers ?? {}),
    },
  });
}

export async function loader({ request }: { request: Request }) {
  try {
    const t0 = Date.now();
    const { ensureSeeded, getPublicProducts } = await import("~/server/db.server");
    await ensureSeeded();

    const url = new URL(request.url);
    const validOnly = url.searchParams.get("valid") === "1";

    const products = await getPublicProducts({ validOnly });

    console.log(`[api/products] ${Date.now() - t0}ms count=${products.length} validOnly=${validOnly}`);

    return json({
      products: products.map((p) => ({
        id: p.id,
        bin: p.bin,
        provider: p.provider,
        type: p.type,
        country: p.country,
        countryFlag: p.countryFlag,
        price: p.priceUsdCents / 100,
        limit: p.limitUsd,
        expiry: p.expiry,
        bank: p.bank,
        cardholder_name: p.fullName ?? null,
        name: p.name,
        street: p.street,
        city: p.city,
        state: p.state,
        address: p.address,
        zip: p.zip,
        extras: p.extras,
        validUntil: p.validUntil,
        color: p.color,
        is_valid: p.isValid,
        is_100_valid: p.isValid,
        tag: p.tag ?? null,
        status: p.status,
        stock: p.stock,
      })),
    });
  } catch (err) {
    console.error("[api/products] loader error:", err);
    return json({ products: [] });
  }
}
