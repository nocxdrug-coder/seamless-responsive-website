import { supabase } from "~/server/supabase.server";
import { getLockStatus, recordFailedAttempt, resetLoginLock } from "~/server/login-lock.server";
import { getUserOrders } from "~/server/db.server";
import bcrypt from "bcryptjs";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const email = body.email?.toLowerCase().trim();
  const name = body.name?.trim();
  const createdDate = body.createdDate;
  const walletBalance = Number(body.walletBalance);
  const totalPurchases = Number(body.totalPurchases);
  const newPassword = body.newPassword;

  if (!email || !name || !createdDate || isNaN(walletBalance) || isNaN(totalPurchases) || !newPassword) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }

  // 1. Fetch user by email
  const { data: user } = await supabase
    .from("users")
    .select("id, email, name, created_at, wallet_usd")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    // Return generic error to prevent email enumeration
    return Response.json({ error: "Recovery failed. Your details did not match our records." }, { status: 401 });
  }

  // 2. Check login lock status
  const lock = await getLockStatus(user.id);
  if (lock.locked) {
    return Response.json({ error: "Account locked. Please try again later.", lockedUntil: lock.lockedUntil }, { status: 403 });
  }

  let failed = false;

  // 3. Verify exact name match (case-insensitive)
  if (user.name.toLowerCase() !== name.toLowerCase()) failed = true;

  // 4. Verify created_at date
  // Supabase stored created_at is in milliseconds
  // We format it to YYYY-MM-DD
  const dbDateStr = new Date(Number(user.created_at)).toISOString().split('T')[0];
  if (dbDateStr !== createdDate) failed = true;

  // 5. Verify Wallet Balance using users.wallet_usd (single source of truth)
  const finalDbBalance = Number(user.wallet_usd);
  if (finalDbBalance !== walletBalance * 100) failed = true; // Converting input dollars to cents

  // 6. Verify Total Purchases (Count of orders)
  // Get all orders by setting a high limit
  const orders = await getUserOrders(user.id, 10000);
  if (orders.length !== totalPurchases) failed = true;

  if (failed) {
    // Record failed attempt
    const newLock = await recordFailedAttempt(user.id);
    if (newLock.locked) {
      return Response.json({ error: "Account locked due to too many failed recovery attempts.", lockedUntil: newLock.lockedUntil }, { status: 403 });
    }
    return Response.json({ error: "Recovery failed. Your details did not match our records." }, { status: 401 });
  }

  // Success 7. Hash new password and update
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const { error } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", user.id);

  if (error) {
    return Response.json({ error: "Database error during reset." }, { status: 500 });
  }

  // Clear any failed attempts
  await resetLoginLock(user.id);

  return Response.json({ success: true });
}
