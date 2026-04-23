/**
 * GET /api/wallet
 * Ultra-fast wallet balance endpoint.
 *
 * SOURCE OF TRUTH: users.wallet_usd directly.
 * Falls back to nothing, is always accurate.
 *
 * Cache: 2s in-process per user (safe for near-real-time balance display).
 * Browser: no-store (balance must never be served from browser cache).
 */
import { findUserById, getWalletBalance } from "~/server/db.server";
import { parseSession } from "~/server/session.server";

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
  const session = parseSession(request);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("USER [cart/wallet]:", session.userId);



  // Fetch user identity + wallet balance in parallel
  // getWalletBalance reads users.wallet_usd directly — single source of truth.
  const [user, walletUsd] = await Promise.all([
    findUserById(session.userId),
    getWalletBalance(session.userId),
  ]);

  if (!user) return json({ error: "User not found" }, { status: 404 });

  console.log("WALLET [cart/wallet]:", walletUsd); console.log(`[api/wallet] userId=${session.userId} wallet_usd=${walletUsd}`);

  const responseData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletUsd,
    walletDisplay: (walletUsd / 100).toFixed(2),
    totalDepositedUsd: user.totalDepositedUsd,
    totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2),
  };

  return json(responseData);
}
