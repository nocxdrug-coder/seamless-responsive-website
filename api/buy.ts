/** POST /api/buy — purchase a card from catalog */
import { supabase } from "../lib/supabase";
import { parseSession } from "../lib/session";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  const session = parseSession(req);
  if (!session) return json({ error: "Unauthorized" }, { status: 401 });

  let body: { productId?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { productId } = body;
  if (!productId) return json({ error: "productId is required" }, { status: 400 });

  const [userRes, productRes] = await Promise.all([
    supabase.from("users").select("id,wallet_usd").eq("id", session.userId).maybeSingle(),
    supabase.from("products").select("*").eq("id", productId).maybeSingle(),
  ]);

  const user    = userRes.data;
  const product = productRes.data;
  if (!user)    return json({ error: "User not found" }, { status: 404 });
  if (!product) return json({ error: "Product not found" }, { status: 404 });

  const pStatus = product.stock > 0 ? "in_stock" : "out_of_stock";
  if (pStatus !== "in_stock") return json({ error: "This card is no longer available" }, { status: 409 });

  const balance = Number(user.wallet_usd);
  const price   = Number(product.price_usd_cents);
  if (balance < price) return json({ error: "Insufficient wallet balance", required: (price / 100).toFixed(2), available: (balance / 100).toFixed(2) }, { status: 402 });

  // Atomically decrement stock (compare-and-swap)
  const { error: stockErr } = await supabase.from("products")
    .update({ stock: product.stock - 1, ...(product.stock - 1 === 0 ? { status: "sold_out" } : {}) })
    .eq("id", productId).eq("stock", product.stock);
  if (stockErr) return json({ error: "This card was just purchased by another user" }, { status: 409 });

  // Create order
  const { data: order, error: orderErr } = await supabase.from("orders")
    .insert([{ user_id: session.userId, product_id: productId, amount_usd_cents: price, status: "pending" }])
    .select("id").single();
  if (orderErr) return json({ error: "Order creation failed" }, { status: 500 });

  // Deduct wallet
  await supabase.from("users").update({ wallet_usd: balance - price }).eq("id", session.userId);
  await supabase.from("transactions").insert([{
    user_id: session.userId, type: "purchase", amount_usd_cents: -price,
    balance_after_cents: balance - price,
    description: `Purchase: ${product.provider} ${product.type} – ${product.country}`,
    order_id: order.id,
  }]);

  // Complete order with card details
  const cardDetails = {
    cardNumber: product.card_number ?? "N/A", cvv: product.cvv ?? "N/A",
    expiry: product.expiry, fullName: product.full_name ?? "N/A",
    bin: product.bin, bank: product.bank,
  };
  await supabase.from("orders").update({ status: "completed", card_details: cardDetails }).eq("id", order.id);

  return json({
    success: true, orderId: order.id, message: "Purchase successful",
    card: { ...cardDetails, provider: product.provider, country: product.country, countryFlag: product.country_flag },
    newBalance: ((balance - price) / 100).toFixed(2),
  });
}
