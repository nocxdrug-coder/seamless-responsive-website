/**
 * GET /api/user
 * Returns the current authenticated user's profile, wallet balance,
 * and recent deposits/transactions (limited for performance).
 *
 * BALANCE SOURCE OF TRUTH: transactions table (balance_after_cents on last row).
 * Falls back to users.wallet_usd if no transactions exist yet.
 *
 * PERFORMANCE: all three queries run in parallel, both list queries capped.
 */
import {
  findUserById,
  getUserDeposits,
  getUserTransactions,
  ensureSeeded,
  getWalletBalance,
} from "~/server/db.server";
import { parseSession } from "~/server/session.server";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",  // balance must always be fresh
      ...(init?.headers ?? {}),
    },
  });
}

export async function loader({ request }: { request: Request }) {
  const t0 = Date.now();
  await ensureSeeded();

  const session = parseSession(request);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user row + wallet balance + both histories — all in parallel
  // getWalletBalance reads users.wallet_usd directly (single source of truth).
  const [user, walletUsd, deposits, transactions] = await Promise.all([
    findUserById(session.userId),
    getWalletBalance(session.userId),
    getUserDeposits(session.userId, 20),
    getUserTransactions(session.userId, 50),
  ]);

  if (!user) return json({ error: "User not found" }, { status: 404 });

  console.log(`[api/user] ${Date.now() - t0}ms userId=${session.userId} wallet_usd=${walletUsd}`);

  return json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletUsd,
    walletDisplay: (walletUsd / 100).toFixed(2),
    totalDepositedUsd: user.totalDepositedUsd,
    totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2),
    deposits: deposits.map((d) => ({
      id: d.id,
      orderSn: d.orderSn,
      amountInr: d.amountInrPaise / 100,
      amountUsd: (d.amountUsdCents / 100).toFixed(2),
      status: d.status,
      createdAt: d.createdAt,
    })),
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: (t.amountUsdCents / 100).toFixed(2),
      balanceAfter: (t.balanceAfterCents / 100).toFixed(2),
      description: t.description,
      createdAt: t.createdAt,
    })),
  });
}
