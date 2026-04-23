-- ============================================================
-- CC Shop — Supabase Schema Migration
-- Run this ONCE in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql
-- ============================================================

-- ── 1. User ID auto-increment sequence ──────────────────────
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 1001;

-- ── 2. Settings (counter store) ─────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO settings (key, value) VALUES ('user_seq', '1000')
ON CONFLICT (key) DO NOTHING;

-- ── 3. Users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  TEXT    PRIMARY KEY,
  email               TEXT    UNIQUE NOT NULL,
  name                TEXT    NOT NULL DEFAULT '',
  password_hash       TEXT    NOT NULL,
  wallet_usd          BIGINT  NOT NULL DEFAULT 0,      -- USD cents
  total_deposited_usd BIGINT  NOT NULL DEFAULT 0,      -- USD cents
  role                TEXT    NOT NULL DEFAULT 'user'
                      CHECK (role IN ('user', 'admin')),
  created_at          BIGINT  NOT NULL DEFAULT
                      (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  activated_at        BIGINT,                          -- set once wallet first becomes > 0
  activation_deadline_at BIGINT,                       -- new user timer (3 days)
  zero_balance_deadline_at BIGINT,                     -- active user zero-balance timer (7 days)
  -- Login lock system
  failed_attempts     INT     NOT NULL DEFAULT 0,
  locked_until        BIGINT                           -- unix ms, NULL = not locked
);

-- Idempotent upgrade for existing deployments (safe to re-run)
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activated_at BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_deadline_at BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zero_balance_deadline_at BIGINT;

-- ── 4. Products ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              TEXT    PRIMARY KEY,
  bin             TEXT    NOT NULL DEFAULT '',
  provider        TEXT    NOT NULL DEFAULT '',
  type            TEXT    NOT NULL DEFAULT '',
  expiry          TEXT    NOT NULL DEFAULT '',
  name            TEXT    NOT NULL DEFAULT '',
  country         TEXT    NOT NULL DEFAULT '',
  country_flag    TEXT    NOT NULL DEFAULT '',
  state           TEXT    NOT NULL DEFAULT '',
  street          TEXT    NOT NULL DEFAULT '',
  city            TEXT    NOT NULL DEFAULT '',
  address         TEXT    NOT NULL DEFAULT '',
  zip             TEXT    NOT NULL DEFAULT '',
  extras          TEXT,
  bank            TEXT    NOT NULL DEFAULT '',
  price_usd_cents BIGINT  NOT NULL DEFAULT 0,
  limit_usd       BIGINT  NOT NULL DEFAULT 0,
  valid_until     TEXT    NOT NULL DEFAULT '',
  -- Display buckets
  is_valid        BOOLEAN NOT NULL DEFAULT FALSE,
  tag             TEXT,
  stock           INT     NOT NULL DEFAULT 1,
  status          TEXT    NOT NULL DEFAULT 'in_stock'
                  CHECK (status IN ('in_stock', 'sold_out')),
  color           TEXT    NOT NULL DEFAULT '#3b82f6',
  card_number     TEXT,
  cvv             TEXT,
  full_name       TEXT
);

-- Idempotent upgrades for existing deployments (safe to re-run)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_valid BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS street TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';

-- Migrate legacy inventory status → in_stock | sold_out
UPDATE products SET stock = 0 WHERE status = 'sold';
UPDATE products SET status = 'sold_out' WHERE stock <= 0 OR status = 'sold';
UPDATE products SET status = 'in_stock' WHERE stock > 0 AND status IN ('available', 'active');
UPDATE products SET status = 'in_stock' WHERE stock > 0 AND status NOT IN ('in_stock', 'sold_out');

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('in_stock', 'sold_out'));

-- ── 5. Orders ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT    PRIMARY KEY,
  user_id          TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id       TEXT    NOT NULL,
  amount_usd_cents BIGINT  NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'completed', 'failed')),
  card_details     JSONB,
  created_at       BIGINT  NOT NULL DEFAULT
                   (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- ── 6. Transactions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                  TEXT    PRIMARY KEY,
  user_id             TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT    NOT NULL
                      CHECK (type IN ('deposit','purchase','admin_credit','admin_debit')),
  amount_usd_cents    BIGINT  NOT NULL,
  balance_after_cents BIGINT  NOT NULL,
  description         TEXT    NOT NULL DEFAULT '',
  ref_id              TEXT    NOT NULL DEFAULT '',
  created_at          BIGINT  NOT NULL DEFAULT
                      (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- ── 7. Deposits ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deposits (
  id               TEXT    PRIMARY KEY,
  user_id          TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_sn         TEXT    UNIQUE NOT NULL,
  amount_inr_paise BIGINT  NOT NULL,
  amount_usd_cents BIGINT  NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'success', 'failed')),
  payment_url      TEXT,
  created_at       BIGINT  NOT NULL DEFAULT
                   (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  processed_at     BIGINT
);

-- ── 8. Processed callbacks (duplicate prevention) ───────────
CREATE TABLE IF NOT EXISTS processed_callbacks (
  order_sn     TEXT   PRIMARY KEY,
  processed_at BIGINT NOT NULL DEFAULT
               (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- ── 9. Atomic user ID generator ─────────────────────────────
CREATE OR REPLACE FUNCTION get_next_user_id()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
BEGIN
  UPDATE settings
  SET    value = (value::BIGINT + 1)::TEXT
  WHERE  key = 'user_seq'
  RETURNING value::BIGINT INTO next_val;
  RETURN 'USR-' || next_val::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ── 10. Disable Row Level Security (server handles auth) ─────
ALTER TABLE users               DISABLE ROW LEVEL SECURITY;
ALTER TABLE products            DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders              DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        DISABLE ROW LEVEL SECURITY;
ALTER TABLE deposits            DISABLE ROW LEVEL SECURITY;
ALTER TABLE processed_callbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings            DISABLE ROW LEVEL SECURITY;

-- ── 11. Indexes for common queries ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_order_sn    ON deposits(order_sn);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id     ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status      ON products(status);
CREATE INDEX IF NOT EXISTS idx_users_locked_until   ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_activation_deadline ON users(activation_deadline_at) WHERE activation_deadline_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_zero_balance_deadline ON users(zero_balance_deadline_at) WHERE zero_balance_deadline_at IS NOT NULL;
