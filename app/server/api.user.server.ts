/**
 * GET /api/user
 * Returns the current authenticated user's profile, wallet balance,
 * and recent deposits/transactions (limited for performance).
 */

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      ...(init?.headers ?? {}),
    },
  });
}

export async function loader({ request }: { request: Request }) {
  try {
    const t0 = Date.now();

    const { ensureSeeded, findUserById, getUserDeposits, getUserTransactions, getWalletBalance } =
      await import("~/server/db.server");
    await ensureSeeded();

    const { parseSession } = await import("~/server/session.server");
    const session = parseSession(request);
    if (!session) {
      return json({ user: null }, { status: 401 });
    }

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
  } catch (err) {
    console.error("[api/user] loader error:", err);
    return json({ user: null }, { status: 401 });
  }
}
