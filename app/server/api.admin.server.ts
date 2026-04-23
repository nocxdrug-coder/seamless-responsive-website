/**
 * Admin API endpoints — ALL require valid __cc_admin session cookie.
 *
 * GET  /api/admin                   — stats dashboard
 * GET  /api/admin?action=users      — all users list
 * GET  /api/admin?action=orders     — all orders (enriched)
 * GET  /api/admin?action=products   — full inventory (in_stock + sold_out)
 * GET  /api/admin?action=search&q=  — find user by email or user ID
 * POST /api/admin                   — adjust user balance / add product
 */


function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export async function loader({ request }: { request: Request }) {
  try {
  const {
    getAdminStats,
    getAllUsers,
    getAllOrders,
    getAllProducts,
    getProductById,
    findUserById,
    findUserByQuery,
    ensureSeeded,
    getWalletBalance,
  } = await import("~/server/db.server");
  const { requireAdminSession } = await import("~/server/session.server");
  const { getClientIp } = await import("~/server/rate-limiter.server");
  const {
    getRecentIpLogs,
    getBannedIps,
    getUserIpHistory,
  } = await import("~/server/ip-security.server");

  await ensureSeeded();
  let session;
  try {
    session = requireAdminSession(request);
  } catch (res) {
    try {
      const { logSecurityEvent } = await import("~/server/security-log.server");
      logSecurityEvent("ADMIN_UNAUTHORIZED", getClientIp(request), { detail: "admin_api_GET" });
    } catch { /* logging is non-critical */ }
    return res as Response;
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "users") {
    const users = await getAllUsers();
    return json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        walletUsd: u.walletUsd,
        walletDisplay: (u.walletUsd / 100).toFixed(2),
        totalDepositedDisplay: (u.totalDepositedUsd / 100).toFixed(2),
        createdAt: u.createdAt,
      })),
    });
  }

  if (action === "search") {
    const q = url.searchParams.get("q") ?? "";
    if (!q.trim()) return json({ error: "Query is required" }, { status: 400 });
    const user = await findUserByQuery(q);
    if (!user) return json({ error: "User not found" }, { status: 404 });
    // Balance from transactions (source of truth)
    const walletUsd = await getWalletBalance(user.id);
    return json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletUsd,
        walletDisplay: (walletUsd / 100).toFixed(2),
        totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2),
        createdAt: user.createdAt,
      },
    });
  }

  if (action === "orders") {
    const limitParam = Math.min(500, Number(url.searchParams.get("limit") ?? "200"));
    const orders = await getAllOrders(limitParam);

    // ── Batch resolve users + products (eliminates N+1) ────────────────────────
    // Collect unique IDs first, fetch each set once in parallel, join in memory.
    const uniqueUserIds    = [...new Set(orders.map((o) => o.userId).filter(Boolean))];
    const uniqueProductIds = [...new Set(orders.map((o) => o.productId).filter(Boolean))];

    const [userResults, productResults] = await Promise.all([
      Promise.all(uniqueUserIds.map((id) => findUserById(id))),
      Promise.all(uniqueProductIds.map((id) => getProductById(id))),
    ]);

    const userMap    = new Map(userResults.filter(Boolean).map((u) => [u!.id, u!]));
    const productMap = new Map(productResults.filter(Boolean).map((p) => [p!.id, p!]));

    const enriched = orders.map((o) => {
      const user    = userMap.get(o.userId);
      const product = productMap.get(o.productId);
      return {
        id:          o.id,
        userId:      o.userId,
        userEmail:   user?.email ?? "N/A",
        productName: product ? `${product.provider} ${product.type}` : "N/A",
        amountUsd:   (o.amountUsdCents / 100).toFixed(2),
        status:      o.status,
        createdAt:   o.createdAt,
      };
    });
    return json({ orders: enriched });
  }

  if (action === "products") {
    const allProducts = await getAllProducts();
    return json({
      products: allProducts.map((p) => ({
        id: p.id,
        bin: p.bin,
        provider: p.provider,
        type: p.type,
        bank: p.bank,
        country: p.country,
        expiry: p.expiry,
        limitUsd: p.limitUsd,
        priceUsdCents: p.priceUsdCents,
        stock: p.stock,
        status: p.status,
      })),
    });
  }

  // ── Security / IP data ────────────────────────────────────────────

  if (action === "ip_logs") {
    const limit = Math.min(500, Number(url.searchParams.get("limit") ?? "100"));
    const logs = await getRecentIpLogs(limit);
    return json({ logs });
  }

  if (action === "banned_ips") {
    const bans = await getBannedIps();
    return json({ bans });
  }

  if (action === "user_ip_history") {
    const userId = url.searchParams.get("userId") ?? "";
    if (!userId) return json({ error: "userId is required" }, { status: 400 });
    const ips = await getUserIpHistory(userId);
    return json({ ips });
  }

  // ── Diagnose: test live read + write permissions ──────────────────────────
  if (action === "diagnose") {
    const { getServerEnv } = await import("~/server/env.server");
    const serviceKeySet = !!getServerEnv("SUPABASE_SERVICE_KEY");
    const anonKeySet    = !!getServerEnv("SUPABASE_ANON_KEY");
    const { supabase }  = await import("~/server/supabase.server");

    // Test read
    const { error: readErr } = await supabase.from("users").select("id").limit(1);
    // Test write: touch the admin row's updated_at (no-op if column doesn't exist, won't harm data)
    // Safest write test: try updating a known-safe no-op on the admin row
    const { error: writeErr } = await supabase
      .from("users")
      .update({ role: "admin" }) // safe no-op — admin is already admin
      .eq("id", "USR-ADMIN-001");

    const readOk  = !readErr;
    const writeOk = !writeErr;

    return json({
      serviceKey:  serviceKeySet ? "set" : "missing",
      anonKey:     anonKeySet    ? "set" : "missing",
      readOk,
      readError:   readErr?.message  ?? null,
      writeOk,
      writeError:  writeErr?.message ?? null,
      summary: !serviceKeySet && !writeOk
        ? "SUPABASE_SERVICE_KEY is missing and the anon key cannot write (RLS is blocking). Add service key to .env to fix Add/Deduct."
        : writeOk
        ? "Write permissions OK. Add/Deduct should work."
        : `Write blocked: ${writeErr?.message}`,
      fixUrl: "https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/settings/api",
    });
  }

  // ── Support Tickets ──────────────────────────────────────────────────────
  if (action === "support_tickets") {
    const { supabase } = await import("~/server/supabase.server");
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      if (error.code === "42P01") return json({ tickets: [] }); // table not yet created
      return json({ error: error.message }, { status: 500 });
    }
    return json({ tickets: data ?? [] });
  }

  // Default: stats
  const stats = await getAdminStats();
  return json({
    totalRevenue: (stats.totalRevenueCents / 100).toFixed(2),
    totalDeposited: (stats.totalDepositedCents / 100).toFixed(2),
    totalUsers: stats.totalUsers,
    totalOrders: stats.totalOrders,
    completedOrders: stats.completedOrders,
    productsAvailable: stats.productsAvailable,
    productsSold: stats.productsSold,
  });
  } catch (err) {
    if (err instanceof Response) throw err;
    console.error("[api/admin] loader error:", err);
    return json({ error: "Service temporarily unavailable." }, { status: 503 });
  }
}

export async function action({ request }: { request: Request }) {
  const {
    adminSetBalance,
    createProduct,
    deleteProductById,
    adminSetProductStock,
    findUserById,
    ensureSeeded,
    getWalletBalance,
  } = await import("~/server/db.server");
  const { bulkImportProductsFromText } = await import("~/server/bulk-cards.server");
  const { requireAdminSession } = await import("~/server/session.server");
  const { getClientIp } = await import("~/server/rate-limiter.server");
  const { banIp, unbanIp } = await import("~/server/ip-security.server");

  await ensureSeeded();
  try {
    requireAdminSession(request);
  } catch (res) {
    return res as Response;
  }

  let body: {
    action?: string;
    userId?: string;
    amountUsd?: number;
    note?: string;
    product?: unknown;
    productId?: string;
    stock?: number;
    text?: string;
    isValid?: boolean;
    pricing?: any;
    // Support ticket reply
    ticketId?: string;
    reply?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Reply to support ticket ─────────────────────────────────────────────
  if (body.action === "reply_ticket") {
    const { ticketId, reply: adminReply } = body;
    if (!ticketId || !adminReply?.trim()) {
      return json({ error: "ticketId and reply are required" }, { status: 400 });
    }
    const { supabase } = await import("~/server/supabase.server");
    const { error } = await supabase
      .from("support_tickets")
      .update({ admin_reply: adminReply.trim(), status: "answered" })
      .eq("id", ticketId);
    if (error) {
      console.error("[api/admin] reply_ticket error:", error);
      return json({ error: error.message }, { status: 500 });
    }
    return json({ success: true });
  }

  if (body.action === "set_balance") {
    const { userId, amountUsd, note } = body;
    console.log(`[api/admin set_balance] received: userId=${userId} amountUsd=${amountUsd} note=${note}`);

    if (!userId || typeof userId !== "string" || !userId.trim()) {
      return json({ error: "userId is required and must be a non-empty string" }, { status: 400 });
    }
    if (amountUsd === undefined || amountUsd === null || typeof amountUsd !== "number" || amountUsd < 0) {
      return json({ error: `amountUsd must be a number >= 0, got: ${JSON.stringify(amountUsd)}` }, { status: 400 });
    }
    try {
      await adminSetBalance(userId.trim(), Math.round(amountUsd * 100), note ?? "Admin adjustment");
      // Re-read the confirmed balance from users.wallet_usd (single source of truth)
      const [user, walletUsd] = await Promise.all([
        findUserById(userId.trim()),
        getWalletBalance(userId.trim()),
      ]);
      const newBalance = ((user?.walletUsd ?? walletUsd) / 100).toFixed(2);
      console.log(`[api/admin set_balance] SUCCESS userId=${userId} newBalance=${newBalance}`);
      return json({ success: true, newBalance });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin set_balance] ERROR:", msg);
      const isRls = msg.includes("row-level security") || msg.includes("RLS") || msg.includes("permission");
      return json(
        {
          error: isRls
            ? `Database write blocked by RLS. Add SUPABASE_SERVICE_KEY to .env. (${msg})`
            : `Failed to update balance: ${msg}`,
        },
        { status: 500 }
      );
    }
  }

  if (body.action === "add_product") {
    const p = body.product as Record<string, string | number | null>;
    if (!p || !p.bin || !p.provider || !p.priceUsdCents) {
      return json({ error: "Missing product fields" }, { status: 400 });
    }
    try {
      const street = String(p.street ?? "").trim();
      const city = String(p.city ?? "").trim();
      const state = String(p.state ?? "N/A");
      const zip = String(p.zip ?? "N/A");
      const addressCombined =
        typeof p.address === "string" && p.address.trim()
          ? p.address.trim()
          : [street, city, state, zip].filter((x) => x && x !== "N/A").join(", ") || "N/A";

      const product = await createProduct({
        bin: String(p.bin),
        provider: String(p.provider),
        type: String(p.type ?? "DEBIT"),
        expiry: String(p.expiry ?? "12/28"),
        name: String(p.name ?? p.provider + "Card"),
        country: String(p.country ?? "US"),
        countryFlag: String(p.countryFlag ?? "🇺🇸"),
        street,
        city: city || "N/A",
        state,
        address: addressCombined,
        zip,
        extras: p.extras ? String(p.extras) : null,
        bank: String(p.bank ?? "N/A"),
        priceUsdCents: Number(p.priceUsdCents),
        limitUsd: Number(p.limitUsd ?? 0),
        validUntil: String(p.validUntil ?? p.expiry ?? "12/28"),
        isValid: Boolean((p.isValid ?? p.is_100_valid) ?? false),
        tag: p.tag ? String(p.tag) : null,
        stock: Math.max(0, Math.floor(Number(p.stock ?? 1))),
        color: String(p.color ?? "#3b82f6"),
        cardNumber: p.cardNumber ? String(p.cardNumber) : undefined,
        cvv: p.cvv ? String(p.cvv) : undefined,
        fullName: p.fullName ? String(p.fullName) : undefined,
      });
      return json({ success: true, productId: product.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin add_product] ERROR:", msg);
      const isRls = msg.includes("row-level security") || msg.includes("RLS") || msg.includes("permission");
      return json(
        { error: isRls ? `DB write blocked by RLS. Add SUPABASE_SERVICE_KEY to .env. (${msg})` : `Failed to add product: ${msg}` },
        { status: 500 }
      );
    }
  }

  if (body.action === "delete_product") {
    const productId = body.productId;
    if (!productId || typeof productId !== "string") {
      return json({ error: "productId is required" }, { status: 400 });
    }
    try {
      await deleteProductById(productId);
      return json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin delete_product] ERROR:", msg);
      return json({ error: `Failed to delete product: ${msg}` }, { status: 500 });
    }
  }

  if (body.action === "update_stock") {
    const productId = body.productId;
    if (!productId || typeof productId !== "string") {
      return json({ error: "productId is required" }, { status: 400 });
    }
    if (body.stock === undefined || typeof body.stock !== "number" || !Number.isFinite(body.stock) || body.stock < 0) {
      return json({ error: "stock (number >= 0) is required" }, { status: 400 });
    }
    try {
      const updated = await adminSetProductStock(productId, body.stock);
      return json({ success: true, product: { id: updated.id, stock: updated.stock, status: updated.status } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin update_stock] ERROR:", msg);
      return json({ error: `Failed to update stock: ${msg}` }, { status: 500 });
    }
  }

  if (body.action === "bulk_import_products") {
    const text = body.text;
    if (typeof text !== "string" || !text.trim()) {
      return json({ error: "text is required" }, { status: 400 });
    }
    try {
      const result = await bulkImportProductsFromText(text, { 
        isValid: Boolean(body.isValid),
        pricing: body.pricing
      });
      return json({ success: true, created: result.created, errors: result.errors });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_import_products] ERROR:", msg);
      const isRls = msg.includes("row-level security") || msg.includes("RLS") || msg.includes("permission");
      return json(
        { error: isRls ? `DB write blocked by RLS. Add SUPABASE_SERVICE_KEY to .env. (${msg})` : `Bulk import failed: ${msg}` },
        { status: 500 }
      );
    }
  }

  // ── Bulk Inventory Actions ────────────────────────────────────────────────

  if (body.action === "bulk_delete_all") {
    try {
      const { supabase } = await import("~/server/supabase.server");
      const { data, error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .is("deleted_at", null)
        .select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_delete_all] soft-deleted ${count} products`);
      return json({ success: true, affected: count });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_delete_all] ERROR:", msg);
      return json({ error: `Bulk delete failed: ${msg}` }, { status: 500 });
    }
  }

  if (body.action === "bulk_mark_sold_out") {
    try {
      const { supabase } = await import("~/server/supabase.server");
      const { data, error } = await supabase
        .from("products")
        .update({ stock: 0, status: "sold_out" })
        .is("deleted_at", null)
        .select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_mark_sold_out] marked ${count} products sold_out`);
      return json({ success: true, affected: count });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_mark_sold_out] ERROR:", msg);
      return json({ error: `Bulk mark sold out failed: ${msg}` }, { status: 500 });
    }
  }

  if (body.action === "bulk_restore_all") {
    try {
      const { supabase } = await import("~/server/supabase.server");
      const { data, error } = await supabase
        .from("products")
        .update({ stock: 1, status: "in_stock" })
        .is("deleted_at", null)
        .select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_restore_all] restored ${count} products to in_stock`);
      return json({ success: true, affected: count });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_restore_all] ERROR:", msg);
      return json({ error: `Bulk restore failed: ${msg}` }, { status: 500 });
    }
  }

  if (body.action === "bulk_recover_deleted") {
    try {
      const { supabase } = await import("~/server/supabase.server");
      const { data, error } = await supabase
        .from("products")
        .update({ deleted_at: null })
        .not("deleted_at", "is", null)
        .select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_recover_deleted] recovered ${count} soft-deleted products`);
      return json({ success: true, affected: count });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_recover_deleted] ERROR:", msg);
      return json({ error: `Bulk recover failed: ${msg}` }, { status: 500 });
    }
  }


  // ── IP Ban Management ──────────────────────────────────────────────

  if (body.action === "ban_ip") {
    const { ip, reason, isPermanent, expiresAt } = body as {
      action: string; ip?: string; reason?: string;
      isPermanent?: boolean; expiresAt?: number;
    };
    if (!ip || typeof ip !== "string" || !ip.trim()) {
      return json({ error: "ip is required" }, { status: 400 });
    }
    try {
      const { requireAdminSession: _req } = await import("~/server/session.server");
      const { getClientIp: _getIp } = await import("~/server/rate-limiter.server");
      const { findUserById: _find } = await import("~/server/db.server");
      const adminSession = _req(request);
      const adminUser = await _find(adminSession.userId).catch(() => null);
      const bannedBy = adminUser?.email ?? "admin";
      await banIp(ip.trim(), reason ?? "", bannedBy, { isPermanent: isPermanent !== false, expiresAt });
      const { logSecurityEvent } = await import("~/server/security-log.server");
      logSecurityEvent("ADMIN_ACTION", _getIp(request), { userId: adminSession.userId, detail: `ban_ip:${ip}` });
      return json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return json({ error: `Failed to ban IP: ${msg}` }, { status: 500 });
    }
  }

  if (body.action === "unban_ip") {
    const { ip } = body as { action: string; ip?: string };
    if (!ip || typeof ip !== "string" || !ip.trim()) {
      return json({ error: "ip is required" }, { status: 400 });
    }
    try {
      await unbanIp(ip.trim());
      const { requireAdminSession: _req } = await import("~/server/session.server");
      const { getClientIp: _getIp } = await import("~/server/rate-limiter.server");
      const adminSession = _req(request);
      const { logSecurityEvent } = await import("~/server/security-log.server");
      logSecurityEvent("ADMIN_ACTION", _getIp(request), { userId: adminSession.userId, detail: `unban_ip:${ip}` });
      return json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return json({ error: `Failed to unban IP: ${msg}` }, { status: 500 });
    }
  }

  return json({ error: `Unknown action: ${String(body.action ?? "")}` }, { status: 400 });
}
