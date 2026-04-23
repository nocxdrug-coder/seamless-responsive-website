/**
 * Account-level login lock system.
 *
 * After MAX_FAILED_ATTEMPTS (5) wrong passwords: account is locked for LOCK_DURATION_MS (10 min).
 * State is persisted in Supabase (survives server restarts).
 * Bypass is available at /only-god-access-x9k2 with BYPASS_SECRET token.
 *
 * SQL REQUIRED — run once in Supabase SQL editor:
 *   ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
 *   ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until BIGINT;
 */
import { supabase } from "./supabase.server";
import { timingSafeEqual } from "node:crypto";

// ─── Config ───────────────────────────────────────────────────────────────────

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MS    = 10 * 60 * 1000; // 10 minutes

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LockStatus {
  locked:         boolean;
  failedAttempts: number;
  remainingMs:    number;        // 0 when not locked
  lockedUntil:    number | null; // unix ms timestamp or null
}

// ─── Read lock status ─────────────────────────────────────────────────────────

export async function getLockStatus(userId: string): Promise<LockStatus> {
  const { data } = await supabase
    .from("users")
    .select("failed_attempts, locked_until")
    .eq("id", userId)
    .maybeSingle();

  const failedAttempts = Number(data?.failed_attempts ?? 0);
  const lockedUntil    = data?.locked_until ? Number(data.locked_until) : null;
  const now            = Date.now();
  const locked         = lockedUntil !== null && now < lockedUntil;
  const remainingMs    = locked ? lockedUntil! - now : 0;

  // Auto-clear expired lock so counter resets
  if (lockedUntil !== null && !locked) {
    await supabase
      .from("users")
      .update({ failed_attempts: 0, locked_until: null })
      .eq("id", userId);
    return { locked: false, failedAttempts: 0, remainingMs: 0, lockedUntil: null };
  }

  return { locked, failedAttempts, remainingMs, lockedUntil };
}

// ─── Record a failed attempt ──────────────────────────────────────────────────

export async function recordFailedAttempt(userId: string): Promise<LockStatus> {
  // Read current count
  const { data } = await supabase
    .from("users")
    .select("failed_attempts")
    .eq("id", userId)
    .maybeSingle();

  const newCount  = Number(data?.failed_attempts ?? 0) + 1;
  const now       = Date.now();
  const shouldLock = newCount >= MAX_FAILED_ATTEMPTS;
  const lockedUntil = shouldLock ? now + LOCK_DURATION_MS : null;

  await supabase
    .from("users")
    .update({
      failed_attempts: newCount,
      locked_until:    lockedUntil,
    })
    .eq("id", userId);

  console.log(
    `[login-lock] userId=${userId} failed_attempts=${newCount}` +
    (shouldLock ? ` → LOCKED for 10min` : "")
  );

  return {
    locked:         shouldLock,
    failedAttempts: newCount,
    remainingMs:    shouldLock ? LOCK_DURATION_MS : 0,
    lockedUntil,
  };
}

// ─── Clear lock (on successful login) ────────────────────────────────────────

export async function resetLoginLock(userId: string): Promise<void> {
  await supabase
    .from("users")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("id", userId);
}

// ─── Bypass: unlock by email ──────────────────────────────────────────────────

export async function unlockByEmail(
  email: string
): Promise<{ found: boolean; was_locked: boolean; email: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const { data } = await supabase
    .from("users")
    .select("id, failed_attempts, locked_until")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!data) return { found: false, was_locked: false, email: normalizedEmail };

  const was_locked =
    data.locked_until !== null && Date.now() < Number(data.locked_until);

  await supabase
    .from("users")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("id", data.id);

  console.log(`[login-lock] BYPASS unlock: ${normalizedEmail} (was_locked=${was_locked})`);
  return { found: true, was_locked, email: normalizedEmail };
}

// ─── Bypass: list all currently locked accounts ───────────────────────────────

export interface LockedAccount {
  id:             string;
  email:          string;
  failedAttempts: number;
  lockedUntil:    number;
  remainingMs:    number;
}

export async function getLockedAccounts(): Promise<LockedAccount[]> {
  const now = Date.now();
  const { data } = await supabase
    .from("users")
    .select("id, email, failed_attempts, locked_until")
    .not("locked_until", "is", null)
    .gt("locked_until", now);

  return (data ?? []).map((row) => ({
    id:             row.id,
    email:          row.email,
    failedAttempts: Number(row.failed_attempts),
    lockedUntil:    Number(row.locked_until),
    remainingMs:    Number(row.locked_until) - now,
  }));
}

// ─── Bypass token validation ──────────────────────────────────────────────────

import { getServerEnv } from "./env.server";
const BYPASS_SECRET = getServerEnv("BYPASS_SECRET") ?? "";

export function isValidBypassToken(token: string): boolean {
  if (!BYPASS_SECRET || !token || token.length < 8) return false;
  try {
    // Pad to equal length for timingSafeEqual (requires same buffer size)
    const len = Math.max(token.length, BYPASS_SECRET.length, 32);
    const a   = Buffer.alloc(len);
    const b   = Buffer.alloc(len);
    a.write(token);
    b.write(BYPASS_SECRET);
    return timingSafeEqual(a, b) && token === BYPASS_SECRET;
  } catch {
    return token === BYPASS_SECRET;
  }
}
