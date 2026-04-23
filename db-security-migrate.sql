-- ============================================================
-- IP Security Migration
-- Run once in: https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new
-- ============================================================

-- ── IP Activity Log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ip_logs (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT,
  ip_address  TEXT    NOT NULL,
  user_agent  TEXT    NOT NULL DEFAULT '',
  route       TEXT    NOT NULL DEFAULT '',
  action      TEXT    NOT NULL DEFAULT '',  -- login|register|purchase|api|error
  status      TEXT    NOT NULL DEFAULT '',  -- success|failed|blocked
  created_at  BIGINT  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ip_logs_ip      ON ip_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_logs_created ON ip_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_logs_user    ON ip_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_logs_action  ON ip_logs(action);

-- ── Banned IPs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banned_ips (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address   TEXT    UNIQUE NOT NULL,
  reason       TEXT    NOT NULL DEFAULT '',
  banned_by    TEXT    NOT NULL DEFAULT 'admin',
  is_permanent BOOLEAN NOT NULL DEFAULT true,
  expires_at   BIGINT,          -- NULL = permanent ban
  created_at   BIGINT  NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_banned_ips_addr ON banned_ips(ip_address);

-- ── RLS: allow service-role full access (anon read-only for ban check) ──
-- If using SUPABASE_SERVICE_KEY these will be bypassed automatically.
-- For anon key usage, enable RLS and add policies if needed:
-- ALTER TABLE ip_logs    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE banned_ips ENABLE ROW LEVEL SECURITY;
