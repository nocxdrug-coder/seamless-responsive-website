-- ============================================================
-- CC Shop — Support Tickets Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id             TEXT    PRIMARY KEY,
  user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_type     TEXT    NOT NULL DEFAULT 'General',
  subject        TEXT    NOT NULL,
  message        TEXT    NOT NULL,
  screenshot_url TEXT,
  status         TEXT    NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'answered', 'closed')),
  admin_reply    TEXT,
  created_at     BIGINT  NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  updated_at     BIGINT  NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- ============================================================
-- Storage Bucket for Screenshots
-- ============================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('tickets', 'tickets', true) 
ON CONFLICT (id) DO NOTHING;

-- Security rules for the public bucket
-- Note: Requires executing in SQL query editor directly
BEGIN;
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  CREATE POLICY "Public Access" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'tickets');

  DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
  CREATE POLICY "Allow Uploads" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'tickets');
COMMIT;
