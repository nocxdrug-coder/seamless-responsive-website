-- ============================================================
-- ADMIN RESET — Password: adminforz21@
-- Run in: https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new
-- ============================================================

INSERT INTO users (
  id, email, name, password_hash,
  wallet_usd, total_deposited_usd, role, created_at, failed_attempts, locked_until
)
VALUES (
  'USR-ADMIN-001',
  'forzaxrosan778@gmail.com',
  'Admin',
  '$2b$12$9U32b.j4kxkq0IYVZUtnceM998RFJ/.1zXpjyhxw4WMX60FpiW9SG',
  0, 0, 'admin', 1713300000000, 0, NULL
)
ON CONFLICT (id) DO UPDATE SET
  email           = 'forzaxrosan778@gmail.com',
  name            = 'Admin',
  password_hash   = '$2b$12$9U32b.j4kxkq0IYVZUtnceM998RFJ/.1zXpjyhxw4WMX60FpiW9SG',
  role            = 'admin',
  failed_attempts = 0,
  locked_until    = NULL;

-- Verify:
SELECT id, email, role, failed_attempts, LEFT(password_hash, 7) AS hash_ok
FROM users WHERE id = 'USR-ADMIN-001';
