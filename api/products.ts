/** GET /api/products — public card catalog */
import { supabase } from "../lib/supabase";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      ...(init?.headers ?? {}),
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const validOnly = url.searchParams.get("valid") === "1";

    let query = supabase
      .from("products")
      .select("*")
      .eq("status", "active");

    if (validOnly) {
      query = query.eq("is_100_valid", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    const products = (data ?? []).map((p: Record<string, unknown>) => {
      const stock = Number(p.stock ?? 0); // ✅ SAFE conversion

      return {
        id: p.id,
        bin: p.bin,
        provider: p.provider,
        type: p.type,
        country: p.country,
        countryFlag: p.country_flag,
        price: Number(p.price_usd_cents ?? 0) / 100,
        limit: p.limit_usd,
        expiry: p.expiry,
        bank: p.bank,
        cardholder_name: p.full_name ?? null,
        name: p.name,
        street: p.street,
        city: p.city,
        state: p.state,
        address: p.address,
        zip: p.zip,
        extras: p.extras,
        validUntil: p.valid_until,
        color: p.color,
        is_valid: p.is_100_valid,
        is_100_valid: p.is_100_valid,
        tag: p.tag ?? null,

        // ✅ FIXED LOGIC
        stock: stock,
        status: stock > 0 ? "in_stock" : "out_of_stock",
      };
    });

    return json({ products });
  } catch (err) {
    console.error("[api/products]", err);
    return json({ products: [] });
  }
}