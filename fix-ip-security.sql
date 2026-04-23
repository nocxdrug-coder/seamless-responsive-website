-- ============================================================
-- IP Security Fix + Upgrade — Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new
-- ============================================================

-- ── 1. Create tables if not already present ──────────────────
CREATE TABLE IF NOT EXISTS ip_logs (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT,
  ip_address  TEXT    NOT NULL,
  user_agent  TEXT    NOT NULL DEFAULT '',
  device      TEXT    NOT NULL DEFAULT 'Unknown',
  os          TEXT    NOT NULL DEFAULT 'Unknown',
  browser     TEXT    NOT NULL DEFAULT 'Unknown',
  route       TEXT    NOT NULL DEFAULT '',
  action      TEXT    NOT NULL DEFAULT '',
  status      TEXT    NOT NULL DEFAULT '',
  created_at  BIGINT  NOT NULL
);

CREATE TABLE IF NOT EXISTS banned_ips (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address   TEXT    UNIQUE NOT NULL,
  reason       TEXT    NOT NULL DEFAULT '',
  banned_by    TEXT    NOT NULL DEFAULT 'admin',
  is_permanent BOOLEAN NOT NULL DEFAULT true,
  expires_at   BIGINT,
  created_at   BIGINT  NOT NULL
);

-- ── 2. Add new columns to existing ip_logs table (safe — idempotent) ─
ALTER TABLE ip_logs ADD COLUMN IF NOT EXISTS device  TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE ip_logs ADD COLUMN IF NOT EXISTS os      TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE ip_logs ADD COLUMN IF NOT EXISTS browser TEXT NOT NULL DEFAULT 'Unknown';

-- ── 3. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ip_logs_ip      ON ip_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_logs_created ON ip_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_logs_user    ON ip_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_logs_action  ON ip_logs(action);
CREATE INDEX IF NOT EXISTS idx_banned_ips_addr ON banned_ips(ip_address);

-- ── 4. DISABLE RLS entirely so anon key can read/write ───────
--    Server enforces auth via HMAC session — DB-level RLS not needed.
ALTER TABLE ip_logs    DISABLE ROW LEVEL SECURITY;
ALTER TABLE banned_ips DISABLE ROW LEVEL SECURITY;

-- ── 5. Grant full access to anon and authenticated roles ─────
GRANT ALL ON ip_logs    TO anon, authenticated;
GRANT ALL ON banned_ips TO anon, authenticated;
