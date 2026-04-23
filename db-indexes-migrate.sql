-- ============================================================
-- Performance Indexes Migration — COMPLETE
-- Run in: https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new
-- Safe to run multiple times (IF NOT EXISTS).
-- ============================================================

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);

-- Composite: the getUserOrders query filters by user_id ORDER BY created_at DESC
-- This lets Postgres do an index-only scan → much faster than seq scan + sort
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, created_at DESC);

-- ── Transactions ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Composite: getUserTransactions filters by user_id ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);

-- ── Deposits ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deposits_user    ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_sn      ON deposits(order_sn);

-- Composite: getUserDeposits filters by user_id ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_deposits_user_date ON deposits(user_id, created_at DESC);

-- ── Products ──────────────────────────────────────────────────────────────────
-- Note: price column is price_usd_cents (integer cents, not price_usd)
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price  ON products(price_usd_cents);

-- Composite: getPublicProducts filters by status + stock > 0, ORDER BY price
CREATE INDEX IF NOT EXISTS idx_products_status_stock_price
  ON products(status, stock, price_usd_cents)
  WHERE status = 'in_stock' AND stock > 0;

-- ── Users ─────────────────────────────────────────────────────────────────────
-- findUserById is the most frequent query — needs index on id (PK, already indexed)
-- findUserByEmail uses email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Admin user prune queries need role + activated_at
CREATE INDEX IF NOT EXISTS idx_users_role_activated ON users(role, activated_at);

-- ── Processed Callbacks ───────────────────────────────────────────────────────
-- isCallbackProcessed queries by order_sn — ensure index exists
CREATE INDEX IF NOT EXISTS idx_processed_callbacks_sn ON processed_callbacks(order_sn);

-- ── Cleanup ───────────────────────────────────────────────────────────────────
-- Safety: drop any incorrectly-named indexes from earlier migrations
DROP INDEX IF EXISTS idx_products_price_usd;
