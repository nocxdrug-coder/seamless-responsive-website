/**
 * Supabase database layer.
 *
 * All data is persisted in Supabase (PostgreSQL). No in-memory state.
 * Session/auth is handled separately via HMAC-signed cookies.
 *
 * Every exported function here is a drop-in replacement for the old
 * in-memory version — API routes require zero changes.
 *
 * IMPORTANT: Server-only module. Never import from client components.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase.server";
import { sanitizeEmail } from "./security-log.server";

// ─── Types (unchanged — all API routes depend on these) ──────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  walletUsd: number;        // USD cents
  totalDepositedUsd: number;
  createdAt: number;
  role: "user" | "admin";
  activatedAt?: number;
  activationDeadlineAt?: number;
  zeroBalanceDeadlineAt?: number;
}

export interface Product {
  id: string;
  bin: string;
  provider: string;
  type: string;
  expiry: string;
  name: string;
  country: string;
  countryFlag: string;
  street: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  extras: string | null;
  bank: string;
  priceUsdCents: number;
  limitUsd: number;
  validUntil: string;
  isValid: boolean;
  tag?: string | null;
  stock: number;
  status: "in_stock" | "sold_out";
  color: string;
  cardNumber?: string;
  cvv?: string;
  fullName?: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  amountUsdCents: number;
  status: "pending" | "completed" | "failed";
  createdAt: number;
  cardDetails?: {
    cardNumber: string;
    cvv: string;
    expiry: string;
    fullName: string;
    bin: string;
    bank: string;
  };
}

export interface Deposit {
  id: string;
  userId: string;
  orderSn: string;
  amountInrPaise: number;
  amountUsdCents: number;
  status: "pending" | "success" | "failed";
  paymentUrl?: string;
  createdAt: number;
  processedAt?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "purchase" | "admin_credit" | "admin_debit";
  amountUsdCents: number;
  balanceAfterCents: number;
  description: string;
  refId: string;
  createdAt: number;
}

// ─── Row → Domain mappers ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    walletUsd: Number(row.wallet_usd),
    totalDepositedUsd: Number(row.total_deposited_usd),
    createdAt: Number(row.created_at),
    role: row.role as "user" | "admin",
    activatedAt: row.activated_at ? Number(row.activated_at) : undefined,
    activationDeadlineAt: row.activation_deadline_at ? Number(row.activation_deadline_at) : undefined,
    zeroBalanceDeadlineAt: row.zero_balance_deadline_at ? Number(row.zero_balance_deadline_at) : undefined,
  };
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface AccountLifecycleState {
  phase: "active" | "activation_required" | "zero_balance_warning";
  deadlineAt: number | null;
  remainingMs: number;
  shouldDelete: boolean;
}

export function getAccountLifecycleState(user: User, nowMs = Date.now()): AccountLifecycleState {
  // SINGLE SOURCE OF TRUTH: positive wallet balance means active, regardless of money origin.
  if (user.walletUsd > 0) {
    return { phase: "active", deadlineAt: null, remainingMs: 0, shouldDelete: false };
  }

  if (!user.activatedAt) {
    const deadlineAt = user.activationDeadlineAt ?? (user.createdAt + THREE_DAYS_MS);
    const remainingMs = Math.max(0, deadlineAt - nowMs);
    return {
      phase: "activation_required",
      deadlineAt,
      remainingMs,
      shouldDelete: remainingMs <= 0,
    };
  }

  const deadlineAt = user.zeroBalanceDeadlineAt ?? (nowMs + SEVEN_DAYS_MS);
  const remainingMs = Math.max(0, deadlineAt - nowMs);
  return {
    phase: "zero_balance_warning",
    deadlineAt,
    remainingMs,
    shouldDelete: remainingMs <= 0,
  };
}

export async function syncUserLifecycle(user: User): Promise<User> {
  // Lifecycle columns are optional (require ALTER TABLE migration).
  // Wrap in try/catch so the app works even if columns don't exist yet.
  try {
    const now = Date.now();
    const updates: Record<string, number | null> = {};

    if (user.walletUsd > 0) {
      if (!user.activatedAt) updates.activated_at = now;
      if (user.activationDeadlineAt) updates.activation_deadline_at = null;
      if (user.zeroBalanceDeadlineAt) updates.zero_balance_deadline_at = null;
    } else if (!user.activatedAt) {
      if (!user.activationDeadlineAt) updates.activation_deadline_at = user.createdAt + THREE_DAYS_MS;
    } else if (!user.zeroBalanceDeadlineAt) {
      updates.zero_balance_deadline_at = now + SEVEN_DAYS_MS;
    }

    if (Object.keys(updates).length === 0) return user;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();
    if (error || !data) return user;
    return rowToUser(data);
  } catch (err) {
    // Columns likely don't exist yet — skip lifecycle update silently
    console.warn("[syncUserLifecycle] skipped (lifecycle columns missing?):", err instanceof Error ? err.message : err);
    return user;
  }
}

export async function deleteUserById(userId: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new Error("Failed to delete user: " + error.message);
}

async function pruneExpiredUsers(nowMs = Date.now()): Promise<void> {
  // Lifecycle columns are optional. If they don't exist, skip pruning silently.
  try {
    const { data: activationExpired } = await supabase
      .from("users")
      .select("id")
      .eq("role", "user")
      .is("activated_at", null)
      .or(`activation_deadline_at.lte.${nowMs},and(activation_deadline_at.is.null,created_at.lte.${nowMs - THREE_DAYS_MS})`);

    for (const row of activationExpired ?? []) {
      await supabase.from("users").delete().eq("id", row.id as string);
    }

    const { data: zeroBalanceExpired } = await supabase
      .from("users")
      .select("id")
      .eq("role", "user")
      .not("activated_at", "is", null)
      .lte("wallet_usd", 0)
      .not("zero_balance_deadline_at", "is", null)
      .lte("zero_balance_deadline_at", nowMs);

    for (const row of zeroBalanceExpired ?? []) {
      await supabase.from("users").delete().eq("id", row.id as string);
    }
  } catch (err) {
    console.warn("[pruneExpiredUsers] skipped (lifecycle columns missing?):", err instanceof Error ? err.message : err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(row: any): Product {
  const stock = Math.max(0, Number(row.stock ?? 0));
  const rawStatus = String(row.status ?? "");
  // Translate DB status ('active'/'sold_out') to app status ('in_stock'/'sold_out')
  // 'active' in DB = in_stock in app layer
  const soldish = stock <= 0 || rawStatus === "sold_out" || rawStatus === "sold" || rawStatus === "inactive";

  return {
    id: row.id,
    bin: row.bin,
    provider: row.provider,
    type: row.type,
    expiry: row.expiry,
    name: row.name,
    country: row.country,
    countryFlag: row.country_flag,
    street: String(row.street ?? ""),
    city: String(row.city ?? ""),
    state: row.state,
    address: row.address,
    zip: row.zip,
    extras: row.extras ?? null,
    bank: row.bank,
    priceUsdCents: Number(row.price_usd_cents),
    limitUsd: Number(row.limit_usd),
    validUntil: row.valid_until,
    isValid: Boolean(row.is_100_valid ?? row.is_valid ?? false),
    tag: row.tag ?? null,
    stock,
    status: soldish ? "sold_out" : "in_stock",
    color: row.color,
    cardNumber: row.card_number ?? undefined,
    cvv: row.cvv ?? undefined,
    fullName: row.full_name ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    amountUsdCents: Number(row.amount_usd_cents),
    status: row.status as Order["status"],
    createdAt: Number(row.created_at),
    cardDetails: row.card_details ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDeposit(row: any): Deposit {
  return {
    id: row.id,
    userId: row.user_id,
    orderSn: row.order_sn,
    amountInrPaise: Number(row.amount_inr_paise),
    amountUsdCents: Number(row.amount_usd_cents),
    status: row.status as Deposit["status"],
    paymentUrl: row.payment_url ?? undefined,
    createdAt: Number(row.created_at),
    processedAt: row.processed_at ? Number(row.processed_at) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as Transaction["type"],
    amountUsdCents: Number(row.amount_usd_cents),
    balanceAfterCents: Number(row.balance_after_cents),
    description: row.description,
    refId: row.ref_id,
    createdAt: Number(row.created_at),
  };
}

// ─── Seeding ──────────────────────────────────────────────────────────────────

let seeded = false;
let totalsBackfilled = false;

// ── Performance gate: only run the expensive ensureSeeded work once per 60s ──
// bcrypt cost-12 takes 200-400ms — running it on every request caused 15-20s
// load times. We now guard the full re-seed behind a 60-second TTL.
let lastSeedRunAt = 0;
const SEED_INTERVAL_MS = 60_000; // 60 seconds

// Lightweight flag: admin credentials were ALREADY verified this process
let adminVerified = false;

const ADMIN_ID = "USR-ADMIN-001";
const ADMIN_EMAIL = sanitizeEmail("forzaxrosan778@gmail.com").toLowerCase().trim();
const ADMIN_NAME = "Admin";
const ADMIN_PASS = "adminforz21@";

async function backfillUserTotalsFromWallet(): Promise<void> {
  if (totalsBackfilled) return;

  const { data: mismatches, error } = await supabase
    .from("users")
    .select("id, wallet_usd, total_deposited_usd")
    .eq("role", "user")
    .gt("wallet_usd", 0);

  if (error) {
    console.error("[backfillUserTotalsFromWallet] query failed:", error.message);
    return;
  }

  for (const row of mismatches ?? []) {
    const wallet = Number(row.wallet_usd);
    const total = Number(row.total_deposited_usd);
    if (wallet <= total) continue;

    const { error: updateErr } = await supabase
      .from("users")
      .update({ total_deposited_usd: wallet })
      .eq("id", row.id as string);

    if (updateErr) {
      console.error("[backfillUserTotalsFromWallet] update failed:", row.id, updateErr.message);
    }
  }

  totalsBackfilled = true;
}

export async function ensureAdminUser(): Promise<void> {
  if (adminVerified) return;

  const { data: existingAdmin, error: lookupErr } = await supabase
    .from("users")
    .select("id, email, password_hash, role")
    .eq("id", ADMIN_ID)
    .maybeSingle();

  if (lookupErr) {
    console.error("[seed] Admin lookup failed:", lookupErr.message);
    return;
  }

  if (!existingAdmin) {
    const adminHash = await bcrypt.hash(ADMIN_PASS, 12);
    const { error: insertErr } = await supabase.from("users").insert({
      id: ADMIN_ID,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password_hash: adminHash,
      wallet_usd: 0,
      total_deposited_usd: 0,
      role: "admin",
      created_at: Date.now(),
    });

    if (insertErr) {
      console.error("[seed] Admin insert failed:", insertErr.message);
      return;
    }

    console.log("[seed] Admin user created.");
    adminVerified = true;
    return;
  }

  const currentEmail = sanitizeEmail(existingAdmin.email).toLowerCase().trim();
  const currentRole = typeof existingAdmin.role === "string" ? existingAdmin.role.trim() : "";
  const storedHash = String(existingAdmin.password_hash ?? "");
  const hashIsValid = storedHash.startsWith("$2")
    ? await bcrypt.compare(ADMIN_PASS, storedHash)
    : false;

  if (currentEmail === ADMIN_EMAIL && currentRole === "admin" && hashIsValid) {
    console.log("[seed] Admin credentials OK.");
    adminVerified = true;
    return;
  }

  console.log("[seed] Admin row mismatch - repairing...");
  const adminHash = hashIsValid ? storedHash : await bcrypt.hash(ADMIN_PASS, 12);
  const { error: updateErr } = await supabase
    .from("users")
    .update({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password_hash: adminHash,
      role: "admin",
      failed_attempts: 0,
      locked_until: null,
    })
    .eq("id", ADMIN_ID);

  if (updateErr) {
    console.error("[seed] Admin update failed (RLS? Missing service key?):", updateErr.message);
    console.error("[seed] FIX: Run fix-admin.sql in Supabase SQL Editor, or add SUPABASE_SERVICE_KEY to .env");
    return;
  }

  console.log("[seed] Admin credentials repaired.");
  adminVerified = true;
}

export async function ensureSeeded(): Promise<void> {
  const now = Date.now();

  // ── Fast-path: skip all expensive work if we ran recently ────────────────
  // This is the PRIMARY performance fix. bcrypt cost-12 takes 200-400ms and
  // was being called on EVERY request. Now it runs at most once per 60 seconds.
  if (seeded && adminVerified && (now - lastSeedRunAt) < SEED_INTERVAL_MS) {
    return; // ← returns in <1ms for all cached requests
  }

  try {
    // Only run the slow maintenance queries if enough time has passed
    if ((now - lastSeedRunAt) >= SEED_INTERVAL_MS) {
      await backfillUserTotalsFromWallet();
      await pruneExpiredUsers();
      lastSeedRunAt = Date.now();
    }

    if (!adminVerified) {
      await ensureAdminUser();
    }


    // ── Sample products (only if products table is empty) ────────────────────
    if (seeded) return; // products already seeded this process

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
      seeded = true; // mark done so we skip product check next request
      return;
    }

    const sampleProductsRaw = [
      { id: "1", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "11/28", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Alaska", address: "A****1", zip: "NO", extras: null, bank: "Bank of America", price_usd_cents: 3600, limit_usd: 287, valid_until: "11/28", is_valid: true, color: "#3b82f6", card_number: "4573830000000001", cvv: "123", full_name: "JOHN DOE" },
      { id: "2", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "11/28", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Alaska", address: "A****1", zip: "NO", extras: null, bank: "Bank of America", price_usd_cents: 3030, limit_usd: 500, valid_until: "11/28", is_valid: true, color: "#3b82f6", card_number: "4573830000000002", cvv: "456", full_name: "JANE SMITH" },
      { id: "3", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "11/28", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Alaska", address: "A****1", zip: "NO", extras: null, bank: "Bank of America", price_usd_cents: 3553, limit_usd: 400, valid_until: "11/28", is_valid: true, color: "#3b82f6", card_number: "4573830000000003", cvv: "789", full_name: "ALICE JOHNSON" },
      { id: "4", bin: "547383", provider: "MASTERCARD", type: "CREDIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "Bank of America", price_usd_cents: 3753, limit_usd: 1000, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000004", cvv: "321", full_name: "BOB WILSON" },
      { id: "5", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "Bank of America", price_usd_cents: 3000, limit_usd: 800, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000005", cvv: "654", full_name: "CAROL BROWN" },
      { id: "6", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "Bank of America", price_usd_cents: 5188, limit_usd: 1500, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000006", cvv: "987", full_name: "DAVE MILLER" },
      { id: "7", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "JPMorgan Chase", price_usd_cents: 4097, limit_usd: 1200, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000007", cvv: "147", full_name: "EVE TAYLOR" },
      { id: "8", bin: "565343", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "UK", country_flag: "🇬🇧", state: "VF", address: "360831", zip: "360831", extras: null, bank: "UK ISDC", price_usd_cents: 3000, limit_usd: 600, valid_until: "12/28", color: "#f59e0b", card_number: "5653430000000008", cvv: "258", full_name: "FRANK GREEN" },
      { id: "9", bin: "411111", provider: "VISA", type: "CREDIT", expiry: "06/27", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "California", address: "90210", zip: "90210", extras: "Yes", bank: "Chase", price_usd_cents: 4200, limit_usd: 2000, valid_until: "06/27", color: "#3b82f6", card_number: "4111110000000009", cvv: "369", full_name: "GRACE HALL" },
      { id: "10", bin: "524135", provider: "MASTERCARD", type: "CREDIT", expiry: "09/26", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Texas", address: "75001", zip: "75001", extras: null, bank: "Wells Fargo", price_usd_cents: 5500, limit_usd: 3000, valid_until: "09/26", color: "#f59e0b", card_number: "5241350000000010", cvv: "741", full_name: "HENRY KING" },
      { id: "11", bin: "374500", provider: "AMEX", type: "CREDIT", expiry: "09/26", name: "AmexCard", country: "US", country_flag: "🇺🇸", state: "New York", address: "10001", zip: "10001", extras: "Yes", bank: "American Express", price_usd_cents: 12000, limit_usd: 5000, valid_until: "09/26", color: "#eab308", card_number: "3745000000000011", cvv: "852", full_name: "IVY LEE" },
      { id: "12", bin: "414720", provider: "VISA", type: "CREDIT", expiry: "12/29", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Florida", address: "33101", zip: "33101", extras: "Yes", bank: "Citibank", price_usd_cents: 19900, limit_usd: 10000, valid_until: "12/29", color: "#3b82f6", card_number: "4147200000000012", cvv: "963", full_name: "JACK WHITE" },
      { id: "13", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "11/28", name: "MasterCard", country: "CA", country_flag: "🇨🇦", state: "Ontario", address: "M5V", zip: "M5V", extras: null, bank: "TD Bank", price_usd_cents: 2850, limit_usd: 400, valid_until: "11/28", color: "#f59e0b", card_number: "5473830000000013", cvv: "159", full_name: "KAREN SCOTT" },
      { id: "14", bin: "476200", provider: "VISA", type: "DEBIT", expiry: "08/27", name: "VisaCard", country: "AU", country_flag: "🇦🇺", state: "NSW", address: "2000", zip: "2000", extras: null, bank: "ANZ", price_usd_cents: 3200, limit_usd: 700, valid_until: "08/27", color: "#3b82f6", card_number: "4762000000000014", cvv: "753", full_name: "LIAM ADAMS" },
      { id: "15", bin: "532013", provider: "MASTERCARD", type: "CREDIT", expiry: "04/29", name: "MasterCard", country: "DE", country_flag: "🇩🇪", state: "Berlin", address: "10117", zip: "10117", extras: "Yes", bank: "Deutsche Bank", price_usd_cents: 6800, limit_usd: 4000, valid_until: "04/29", color: "#f59e0b", card_number: "5320130000000015", cvv: "357", full_name: "MIA BAKER" },
      { id: "16", bin: "400000", provider: "VISA", type: "CREDIT", expiry: "03/28", name: "VisaCard", country: "FR", country_flag: "🇫🇷", state: "Paris", address: "75001", zip: "75001", extras: null, bank: "BNP Paribas", price_usd_cents: 7500, limit_usd: 5000, valid_until: "03/28", color: "#3b82f6", card_number: "4000000000000016", cvv: "951", full_name: "NOAH CLARK" },
      { id: "17", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "07/27", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Ohio", address: "44101", zip: "44101", extras: null, bank: "PNC Bank", price_usd_cents: 3375, limit_usd: 450, valid_until: "07/27", color: "#3b82f6", card_number: "5473830000000017", cvv: "246", full_name: "OLIVIA DAVIS" },
      { id: "18", bin: "520082", provider: "MASTERCARD", type: "DEBIT", expiry: "10/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Georgia", address: "30301", zip: "30301", extras: null, bank: "SunTrust", price_usd_cents: 2999, limit_usd: 350, valid_until: "10/28", color: "#f59e0b", card_number: "5200820000000018", cvv: "864", full_name: "PETER EVANS" },
      { id: "19", bin: "451166", provider: "VISA", type: "CREDIT", expiry: "05/29", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Illinois", address: "60601", zip: "60601", extras: "Yes", bank: "US Bank", price_usd_cents: 8800, limit_usd: 6000, valid_until: "05/29", color: "#3b82f6", card_number: "4511660000000019", cvv: "135", full_name: "QUINN FOSTER" },
      { id: "20", bin: "545616", provider: "MASTERCARD", type: "CREDIT", expiry: "01/30", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Washington", address: "98101", zip: "98101", extras: "Yes", bank: "Key Bank", price_usd_cents: 9550, limit_usd: 7500, valid_until: "01/30", color: "#f59e0b", card_number: "5456160000000020", cvv: "975", full_name: "RACHEL GRAY" },
    ];

    const sampleProducts = sampleProductsRaw.map((p) => ({
      ...p,
      stock: 1,
      status: "in_stock" as const,
      street: "",
      city: "",
    }));

    const { error: prodErr } = await supabase.from("products").insert(sampleProducts);
    if (prodErr) console.error("[seed] Products insert failed:", prodErr.message);
    else console.log(`[seed] ${sampleProducts.length} products seeded.`);

    seeded = true; // mark products as seeded
    console.log("[seed] ✓ Database ready.");

  } catch (err) {
    console.error(
      "[seed] ✗ Supabase seeding failed. Is the SQL migration run?\n" +
      "        Run db-migrate.sql in: https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new\n" +
      "        Error:", err instanceof Error ? err.message : String(err)
    );
  }
}

// ─── User Operations ──────────────────────────────────────────────────────────

export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<User | null> {
  await ensureSeeded();

  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing email
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (existing) return null;

  // Generate next USR-XXXX id by finding the current max numeric ID.
  // This avoids needing an RPC / stored procedure (which requires service role key).
  const { data: allIds } = await supabase
    .from("users")
    .select("id")
    .like("id", "USR-%")
    .not("id", "like", "USR-ADMIN%");

  const maxNum = (allIds ?? []).reduce((max, row) => {
    const n = parseInt((row.id as string).replace("USR-", ""), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 1000);

  const id = `USR-${maxNum + 1}`;

  const hash = await bcrypt.hash(password, 12);
  const now = Date.now();

  const { data, error } = await supabase
    .from("users")
    .insert({
      id,
      email: normalizedEmail,
      name: name.trim(),
      password_hash: hash,
      wallet_usd: 0,
      total_deposited_usd: 0,
      role: "user",
      created_at: now,
      // Note: activated_at, activation_deadline_at, zero_balance_deadline_at are optional
      // columns added by the ALTER TABLE migration. Do NOT include them here — if the
      // columns don't exist yet the INSERT will fail. If they do exist, their DEFAULT
      // (null / 0) will be used automatically by Supabase.
    })
    .select()
    .single();

  if (error) {
    // Distinguish RLS / connectivity errors from a duplicate-key conflict.
    // 23505 = unique_violation (email already exists) — should have been caught above
    // but handle just in case. Anything else is a real DB failure.
    if (error.code === "23505") {
      console.warn("[createUser] duplicate email race (23505):", normalizedEmail);
      return null; // email taken
    }
    // For RLS, connectivity, or any other error → throw so the route returns 503
    console.error("[createUser] INSERT failed:", error.code, error.message);
    throw new Error(
      error.message.includes("row-level security")
        ? "Database write blocked (RLS). Add SUPABASE_SERVICE_KEY to .env — see /api/health"
        : `Database error: ${error.message}`
    );
  }
  console.log("[createUser] ✓ Created user:", id, normalizedEmail);
  return rowToUser(data);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await ensureSeeded();
  const normalizedEmail = email.toLowerCase().trim();
  console.log("[findUserByEmail] looking up:", normalizedEmail);
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (error) console.error("[findUserByEmail] query error:", error.message);
  console.log("[findUserByEmail] result:", data ? `found id=${data.id}` : "not found");
  return data ? rowToUser(data) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  await ensureSeeded();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? rowToUser(data) : null;
}

/** Admin search: find user by email OR user ID (case-insensitive). */
export async function findUserByQuery(query: string): Promise<User | null> {
  await ensureSeeded();
  const q = query.trim().toLowerCase();
  const { data } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${q},id.ilike.${q}`)
    .maybeSingle();
  return data ? rowToUser(data) : null;
}

/**
 * Get wallet balance directly from users.wallet_usd.
 * This is the SINGLE SOURCE OF TRUTH — always kept in sync by adjustWallet.
 * Fast: single row SELECT on indexed primary key.
 */
export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("users")
    .select("wallet_usd")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error(`[getWalletBalance] failed for userId=${userId}:`, error?.message);
    return 0;
  }
  console.log(`[getWalletBalance] userId=${userId} wallet_usd=${data.wallet_usd}`);
  return Number(data.wallet_usd);
}


export async function verifyPassword(user: User, password: string): Promise<boolean> {
  const result = await bcrypt.compare(password, user.passwordHash);
  console.log(`[verifyPassword] user=${user.email} match=${result}`);
  return result;
}

export async function adjustWallet(
  userId: string,
  deltaCents: number,
  type: Transaction["type"],
  description: string,
  refId: string
): Promise<void> {
  console.log(`[adjustWallet] START userId=${userId} delta=${deltaCents} type=${type}`);

  const user = await findUserById(userId);
  if (!user) {
    console.error(`[adjustWallet] FAIL: no user row for userId=${userId}`);
    throw new Error(`User not found (id=${userId}).`);
  }

  // users.wallet_usd is the single source of truth — always in sync.
  const current = Number(user.walletUsd);
  const newBalance = Math.max(0, current + deltaCents);

  console.log(`[adjustWallet] userId=${userId} currentBalance=${current} delta=${deltaCents} newBalance=${newBalance}`);

  // UPDATE users.wallet_usd first (atomic source of truth).
  const { error: walletErr } = await supabase
    .from("users")
    .update({
      wallet_usd: newBalance,
      total_deposited_usd: deltaCents > 0
        ? user.totalDepositedUsd + deltaCents
        : user.totalDepositedUsd,
    })
    .eq("id", userId);

  if (walletErr) {
    console.error(`[adjustWallet] wallet_usd update failed for userId=${userId}:`, walletErr.message);
    throw new Error(`Failed to update wallet: ${walletErr.message}`);
  }

  // INSERT transaction record for audit/history.
  const txId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const { error: txErr } = await supabase.from("transactions").insert({
    id: txId,
    user_id: userId,
    type,
    amount_usd_cents: Math.abs(deltaCents),
    balance_after_cents: newBalance,
    description,
    ref_id: refId,
    created_at: Date.now(),
  });

  if (txErr) {
    // Non-fatal: wallet is already updated. Log for audit reconciliation.
    console.error(`[adjustWallet] transaction INSERT failed (non-fatal, wallet already updated) userId=${userId}:`, txErr.code, txErr.message);
  } else {
    console.log(`[adjustWallet] OK — txId=${txId} newBalance=${newBalance}`);
  }
}

export async function adminSetBalance(
  userId: string,
  amountUsdCents: number,
  note: string
): Promise<void> {
  console.log(`[adminSetBalance] START userId=${userId} targetCents=${amountUsdCents}`);

  const user = await findUserById(userId);
  if (!user) {
    console.error(`[adminSetBalance] FAIL: no user for userId=${userId}`);
    throw new Error(`User not found (id=${userId}). Verify the user ID is correct.`);
  }

  // users.wallet_usd is the single source of truth.
  const current = Number(user.walletUsd);
  const delta = amountUsdCents - current;

  if (delta === 0) {
    console.log(`[adminSetBalance] NO-OP: balance already at ${amountUsdCents} for userId=${userId}`);
    return;
  }

  const type: Transaction["type"] = delta >= 0 ? "admin_credit" : "admin_debit";

  console.log(`[adminSetBalance] userId=${userId} current=${current} target=${amountUsdCents} delta=${delta} type=${type}`);

  await adjustWallet(userId, delta, type, note || "Admin balance adjustment", "ADMIN");

  console.log(`[adminSetBalance] OK userId=${userId} newBalance=${amountUsdCents}`);
}

export async function getAllUsers(): Promise<User[]> {
  await ensureSeeded();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[getAllUsers]", error.message); return []; }
  return (data ?? []).map(rowToUser);
}

// ─── Product Operations ───────────────────────────────────────────────────────

export async function getAvailableProducts(): Promise<Product[]> {
  await ensureSeeded();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or("status.eq.active,status.eq.in_stock")
    .gt("stock", 0);
  if (error) { console.error("[getAvailableProducts]", error.message); return []; }
  return (data ?? []).map(rowToProduct);
}

export async function getPublicProducts(opts?: { validOnly?: boolean }): Promise<Product[]> {
  await ensureSeeded();

  let q = supabase
    .from("products")
    .select("*")
    .or("status.eq.active,status.eq.in_stock")
    .gt("stock", 0);

  q = q.eq("is_100_valid", opts?.validOnly ? true : false);

  const { data, error } = await q.order("price_usd_cents", { ascending: true });
  if (error) {
    console.error("[getPublicProducts]", error.message);
    return [];
  }
  return (data ?? []).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  await ensureSeeded();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? rowToProduct(data) : null;
}

// ── Product status normalizer ──────────────────────────────────────────────────
// DB constraint: CHECK (status IN ('active', 'inactive', 'sold_out'))
// ⚠️  Always use THIS function before any INSERT or UPDATE — never hardcode status.
function normalizeProductStatus(stock: number, rawStatus?: string): "active" | "sold_out" {
  if (stock <= 0) return "sold_out";
  if (rawStatus === "sold_out" || rawStatus === "sold" || rawStatus === "inactive") return "sold_out";
  // 'in_stock', 'open', 'active', undefined, null → 'active'
  return "active";
}

export async function createProduct(data: Omit<Product, "id" | "status">): Promise<Product> {
  await ensureSeeded();
  const id = `PROD-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const stock = Math.max(0, Math.floor(Number(data.stock)));
  const status = normalizeProductStatus(stock);

  const rawPayload = {
    id,
    bin: data.bin,
    provider: data.provider,
    type: data.type,
    expiry: data.expiry,
    name: data.name,
    country: data.country,
    country_flag: data.countryFlag,
    street: data.street ?? "",
    city: data.city ?? "",
    state: data.state,
    address: data.address,
    zip: data.zip,
    extras: data.extras ?? null,
    bank: data.bank,
    price_usd_cents: data.priceUsdCents,
    limit_usd: data.limitUsd,
    valid_until: data.validUntil,
    is_100_valid: data.isValid ?? false,
    tag: data.tag ?? null,
    stock,
    status,
    color: data.color,
    card_number: data.cardNumber ?? null,
    cvv: data.cvv ?? null,
    full_name: data.fullName ?? null,
  };

  // DEBUG: Log raw payload
  console.log("[createProduct] Raw payload keys:", Object.keys(rawPayload));
  console.log("[createProduct] Raw payload:", JSON.stringify(rawPayload, null, 2));

  // Include ALL columns - disable column filtering
  const cleanPayload = rawPayload;

  console.log("[createProduct] Inserting to Supabase...");
  const { data: row, error } = await supabase
    .from("products")
    .insert(cleanPayload)
    .select()
    .single();

  if (error) {
    console.error("[createProduct] SUPABASE ERROR:", error);
    console.error("[createProduct] Error code:", error.code);
    console.error("[createProduct] Error details:", error.details);
    console.error("[createProduct] Error hint:", error.hint);
    if (error.message.includes("Could not find") && error.message.includes("column")) {
      console.error("[createProduct] SCHEMA ERROR:", error.message);
      throw new Error(`Schema mismatch: ${error.message}. Run fix-products-columns.sql and refresh Supabase schema cache.`);
    }
    throw new Error("Failed to create product: " + error.message);
  }
  console.log("[createProduct] SUCCESS:", row?.id);
  return rowToProduct(row);
}

/**
 * Atomically decrements stock after a purchase. Returns false if the row was
 * already sold out or another request won the race.
 */
export async function decrementProductStockAfterPurchase(productId: string): Promise<boolean> {
  const product = await getProductById(productId);
  if (!product) return false;
  if (product.stock <= 0 || product.status === "sold_out") return false;
  const nextStock = product.stock - 1;
  const nextStatus = normalizeProductStatus(nextStock);
  const { data, error } = await supabase
    .from("products")
    .update({ stock: nextStock, status: nextStatus })
    .eq("id", productId)
    .eq("stock", product.stock)
    .select("id");
  if (error) {
    console.error("[decrementProductStockAfterPurchase]", error.message);
    return false;
  }
  return (data ?? []).length > 0;
}

export async function deleteProductById(productId: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error("Failed to delete product: " + error.message);
}

export async function adminSetProductStock(productId: string, stock: number): Promise<Product> {
  const s = Math.max(0, Math.floor(Number(stock)));
  const status = normalizeProductStatus(s);

  console.log("[adminSetProductStock] Updating product ID:", productId, "→ stock:", s, "status:", status);

  // Step 1: Verify product exists first — SELECT is reliable even with anon key
  const existing = await getProductById(productId);
  if (!existing) {
    throw new Error(`Failed to update stock: product not found (id=${productId})`);
  }

  // Step 2: Plain UPDATE without chained .select().single() — avoids coerce errors
  const { error } = await supabase
    .from("products")
    .update({ stock: s, status })
    .eq("id", productId);

  if (error) throw new Error("Failed to update stock: " + error.message);

  // Step 3: Re-fetch to return confirmed state
  const updated = await getProductById(productId);
  if (!updated) throw new Error("Updated but could not re-fetch product (id=" + productId + ")");
  console.log("[adminSetProductStock] OK");
  return updated;
}

export async function getAllProducts(): Promise<Product[]> {
  await ensureSeeded();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("status", { ascending: true });
  if (error) { console.error("[getAllProducts]", error.message); return []; }
  return (data ?? []).map(rowToProduct);
}

// ─── Order Operations ─────────────────────────────────────────────────────────

export async function createOrder(
  userId: string,
  productId: string,
  amountUsdCents: number
): Promise<Order> {
  const id = `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const now = Date.now();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      id,
      user_id: userId,
      product_id: productId,
      amount_usd_cents: amountUsdCents,
      status: "pending",
      created_at: now,
    })
    .select()
    .single();
  if (error) throw new Error("Failed to create order: " + error.message);
  return rowToOrder(data);
}

export async function completeOrder(
  orderId: string,
  cardDetails: Order["cardDetails"]
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: "completed", card_details: cardDetails ?? null })
    .eq("id", orderId);
  if (error) throw new Error("Failed to complete order: " + error.message);
}

export async function getUserOrders(userId: string, limit = 50): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("[getUserOrders]", error.message); return []; }
  return (data ?? []).map(rowToOrder);
}

export async function getAllOrders(limit = 200): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("[getAllOrders]", error.message); return []; }
  return (data ?? []).map(rowToOrder);
}

// ─── Deposit Operations ───────────────────────────────────────────────────────

export async function createDeposit(
  userId: string,
  orderSn: string,
  amountInrPaise: number,
  amountUsdCents: number
): Promise<Deposit> {
  const id = `DEP-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const now = Date.now();
  const { data, error } = await supabase
    .from("deposits")
    .insert({
      id,
      user_id: userId,
      order_sn: orderSn,
      amount_inr_paise: amountInrPaise,
      amount_usd_cents: amountUsdCents,
      status: "pending",
      created_at: now,
    })
    .select()
    .single();
  if (error) throw new Error("Failed to create deposit: " + error.message);
  return rowToDeposit(data);
}

export async function findDepositByOrderSn(orderSn: string): Promise<Deposit | null> {
  const { data } = await supabase
    .from("deposits")
    .select("*")
    .eq("order_sn", orderSn)
    .maybeSingle();
  return data ? rowToDeposit(data) : null;
}

export async function updateDepositSuccess(depositId: string, userId: string): Promise<void> {
  const { data: dep } = await supabase
    .from("deposits")
    .select("*")
    .eq("id", depositId)
    .single();
  if (!dep) throw new Error("Deposit not found");

  const now = Date.now();

  // Mark deposit success
  await supabase
    .from("deposits")
    .update({ status: "success", processed_at: now })
    .eq("id", depositId);

  // Credit wallet + record transaction
  await adjustWallet(
    userId,
    Number(dep.amount_usd_cents),
    "deposit",
    `UPI deposit ₹${(Number(dep.amount_inr_paise) / 100).toFixed(0)} → $${(Number(dep.amount_usd_cents) / 100).toFixed(2)}`,
    depositId
  );
}

export async function getUserDeposits(userId: string, limit = 20): Promise<Deposit[]> {
  const { data, error } = await supabase
    .from("deposits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit); // ← was unbounded; capped at 20 for UI performance
  if (error) { console.error("[getUserDeposits]", error.message); return []; }
  return (data ?? []).map(rowToDeposit);
}

// ─── Transaction Operations ───────────────────────────────────────────────────

export async function getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit); // ← was unbounded; capped at 50 for UI performance
  if (error) { console.error("[getUserTransactions]", error.message); return []; }
  return (data ?? []).map(rowToTransaction);
}

export async function getAllTransactions(limit = 200): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("[getAllTransactions]", error.message); return []; }
  return (data ?? []).map(rowToTransaction);
}

// ─── Callback Duplicate Prevention ───────────────────────────────────────────

export async function isCallbackProcessed(orderSn: string): Promise<boolean> {
  const { data } = await supabase
    .from("processed_callbacks")
    .select("order_sn")
    .eq("order_sn", orderSn)
    .maybeSingle();
  return !!data;
}

export async function markCallbackProcessed(orderSn: string): Promise<void> {
  // Use upsert with ignoreDuplicates to safely ignore if already exists
  await supabase
    .from("processed_callbacks")
    .upsert(
      { order_sn: orderSn, processed_at: Date.now() },
      { onConflict: "order_sn", ignoreDuplicates: true }
    );
}

// ─── Admin Stats (single-round-trip aggregation) ──────────────────────────────

export async function getAdminStats() {
  await ensureSeeded();

  // Run all 5 queries concurrently — none block each other.
  // Revenue/deposit: only fetch the numeric columns needed, no full rows.
  const [usersRes, ordersRes, txRes, prodAvailRes, prodSoldRes] = await Promise.all([
    supabase.from("users").select("role", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("orders").select("amount_usd_cents,status").limit(2000),
    supabase.from("transactions").select("amount_usd_cents").eq("type", "deposit").limit(2000),
    supabase.from("products").select("id", { count: "exact", head: true }).or("status.eq.active,status.eq.in_stock"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "sold_out"),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenueCents = orders.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.amount_usd_cents), 0);
  const totalDepositedCents = (txRes.data ?? []).reduce((s, t) => s + Number(t.amount_usd_cents), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  return {
    totalUsers: usersRes.count ?? 0,
    totalOrders,
    completedOrders,
    totalRevenueCents,
    totalDepositedCents,
    productsAvailable: prodAvailRes.count ?? 0,
    productsSold: prodSoldRes.count ?? 0,
  };
}
