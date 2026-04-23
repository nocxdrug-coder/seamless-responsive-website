-- ============================================================
-- Add deleted_at column to products table (safe / idempotent)
-- Run once in: https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Index for fast "active only" queries
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at)
  WHERE deleted_at IS NULL;
