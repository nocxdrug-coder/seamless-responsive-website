-- ===================================================================
-- CC Shop — Support Tickets Column Fix
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql
-- ===================================================================

-- ── FIX: Change user_id column from UUID → TEXT ───────────────────
--
-- The app uses custom TEXT IDs like "USR-1003" (not Supabase UUIDs).
-- The previous migration created user_id as UUID which rejects these.
-- We drop and recreate the column as TEXT to match the actual user IDs.

-- Step 1: Drop the existing foreign key constraint if any
ALTER TABLE support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;

-- Step 2: Change column type UUID → TEXT
ALTER TABLE support_tickets
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 3: Ensure RLS is still disabled (required for custom session auth)
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;

-- Step 4: Clean up any stale policies
DROP POLICY IF EXISTS "Allow authenticated user insert" ON support_tickets;
DROP POLICY IF EXISTS "Allow authenticated user select" ON support_tickets;
DROP POLICY IF EXISTS "Allow authenticated user update" ON support_tickets;

-- Done. The support_tickets table now accepts "USR-xxxx" style user IDs.
