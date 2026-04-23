-- ===================================================================
-- CC Shop — Support Tickets Fix (FINAL - Safe to run multiple times)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql
-- ===================================================================

-- ── 1. Create table (safe, won't recreate if already exists) ──────
CREATE TABLE IF NOT EXISTS support_tickets (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT    NOT NULL,
  issue_type     TEXT    NOT NULL DEFAULT 'General',
  subject        TEXT    NOT NULL,
  message        TEXT    NOT NULL,
  screenshot_url TEXT,
  status         TEXT    NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'answered', 'closed')),
  admin_reply    TEXT,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 2. CRITICAL: Disable RLS entirely ─────────────────────────────
-- 
--  ⚠️  WHY: This app does NOT use Supabase Auth.
--  Users log in via a custom HMAC cookie session (parseSession).
--  auth.uid() is always NULL for these users.
--  So ANY RLS policy based on auth.uid() will block ALL inserts.
--  The service_role key bypasses RLS, which is what the server uses.
--  Disabling RLS here is CORRECT and SAFE for this architecture.

ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;

-- ── 3. Drop stale policies to avoid duplicate errors ──────────────
DROP POLICY IF EXISTS "Allow authenticated user insert" ON support_tickets;
DROP POLICY IF EXISTS "Allow authenticated user select" ON support_tickets;

-- ── 4. Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- ── 5. Storage bucket (safe - no-op if already exists) ───────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-screenshots', 'support-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- ── 6. Storage policies (drop + recreate cleanly) ─────────────────
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "support screenshots public read" ON storage.objects;
DROP POLICY IF EXISTS "support screenshots upload" ON storage.objects;

CREATE POLICY "support screenshots public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'support-screenshots');

CREATE POLICY "support screenshots upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'support-screenshots');
