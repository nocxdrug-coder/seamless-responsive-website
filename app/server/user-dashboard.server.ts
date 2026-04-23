import { redirect } from "react-router";
import { parseSession } from "~/server/session.server";
import {
  findUserById,
  getWalletBalance,
  getUserOrders,
  getUserTransactions,
} from "~/server/db.server";
import { supabase } from "~/server/supabase.server";

export async function loader({ request }: { request: Request }) {
  const session = parseSession(request);
  if (!session) {
    return redirect("/login");
  }

  console.log("USER [dashboard]:", session.userId);

  const walletUsd = await getWalletBalance(session.userId);

  console.log("WALLET [dashboard]:", walletUsd);

  // Fetch everything in parallel on the server — no client-side fetches needed
  // getWalletBalance reads users.wallet_usd directly (single source of truth).
  // This is the SAME value the cart reads via /api/wallet + useWallet() hook.
  const [user, orders, transactions] = await Promise.all([
    findUserById(session.userId),
    getUserOrders(session.userId, 50),
    getUserTransactions(session.userId, 50),
  ]);

  if (!user) {
    return redirect("/login");
  }

  console.log(
    `[dashboard loader] userId=${session.userId} wallet_usd=${walletUsd} orders=${orders.length} transactions=${transactions.length}`
  );

  const pendingOrders   = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  // 14-days chart generation
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now).setHours(0,0,0,0);
  const cutoff = startOfToday - (13 * DAY_MS); // 13 days ago + today = 14 days
  
  // Real dynamic queries
  const [depositsResult, ordersResult] = await Promise.all([
    supabase.from("transactions").select("amount_usd_cents, created_at").eq("user_id", session.userId).eq("type", "deposit").gte("created_at", cutoff),
    supabase.from("orders").select("amount_usd_cents, created_at").eq("user_id", session.userId).gte("created_at", cutoff),
  ]);

  const depositsData = depositsResult.data || [];
  const ordersData = ordersResult.data || [];

  const chartData = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = startOfToday - (i * DAY_MS);
    const dayEnd = dayStart + DAY_MS - 1;
    const dateLabel = new Date(dayStart).toLocaleDateString("en-US", { month: "short", day: "2-digit" });

    // Sum cents, turn to float
    const depsCents = depositsData.filter(d => Number(d.created_at) >= dayStart && Number(d.created_at) <= dayEnd).reduce((sum, d) => sum + Number(d.amount_usd_cents), 0);
    const ordsCents = ordersData.filter(d => Number(d.created_at) >= dayStart && Number(d.created_at) <= dayEnd).reduce((sum, d) => sum + Number(d.amount_usd_cents), 0);

    chartData.push({
      date: dateLabel,
      deposits: depsCents / 100,
      orders: ordsCents / 100,
    });
  }

  return Response.json({
    // User identity
    userId:    user.id,
    userEmail: user.email,
    userName:  user.name,
    userRole:  user.role,
    // Wallet
    walletUsd,
    walletDisplay:          (walletUsd / 100).toFixed(2),
    totalDepositedUsd:      user.totalDepositedUsd,
    totalDepositedDisplay:  (user.totalDepositedUsd / 100).toFixed(2),
    // Orders
    totalOrders:     orders.length,
    pendingOrders,
    completedOrders,
    // Recent transactions
    transactions: transactions.slice(0, 10).map((t) => ({
      id:          t.id,
      type:        t.type,
      amount:      (t.amountUsdCents / 100).toFixed(2),
      balanceAfter:(t.balanceAfterCents / 100).toFixed(2),
      description: t.description,
      createdAt:   t.createdAt,
    })),
    // Chart grouping
    chartData,
  });
}
