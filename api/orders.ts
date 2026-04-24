/** GET /api/orders — user order history */
import { supabase } from "../lib/supabase";
import { parseSession } from "../lib/session";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=10", ...(init?.headers ?? {}) },
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const session = parseSession(req);
    if (!session) return json({ orders: [] }, { status: 401 });

    const url = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "30")));

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id,status,amount_usd_cents,created_at,product_id,card_details")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const uniqueIds = [...new Set((orders ?? []).map((o: Record<string, unknown>) => o.product_id as string))];
    const { data: products } = await supabase.from("products").select("id,name,provider,type,country,country_flag,bank").in("id", uniqueIds);
    const productMap = new Map((products ?? []).map((p: Record<string, unknown>) => [p.id, p]));

    const enriched = (orders ?? []).map((o: Record<string, unknown>) => {
      const p = productMap.get(o.product_id as string);
      return {
        id: o.id, status: o.status,
        amountUsd: (Number(o.amount_usd_cents) / 100).toFixed(2),
        createdAt: o.created_at,
        product: p ? { id: p.id, name: p.name, provider: p.provider, type: p.type, country: p.country, countryFlag: p.country_flag, bank: p.bank } : null,
        cardDetails: o.status === "completed" ? o.card_details : null,
      };
    });

    return json({ orders: enriched });
  } catch (err) {
    console.error("[api/orders]", err);
    return json({ orders: [] });
  }
}
