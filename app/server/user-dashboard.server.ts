import { redirect } from "react-router";
import { parseSession } from "~/server/session.server";

// Safe fallback payload when DB is unreachable or env vars are missing
function emptyDashboard(userId: string, userEmail: string) {
  return {
    userId,
    userEmail,
    userName: null,
    userRole: "user",
    walletUsd: 0,
    walletDisplay: "0.00",
    totalDepositedUsd: 0,
    totalDepositedDisplay: "0.00",
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    transactions: [],
    chartData: [],
  };
}

export async function loader({ request }: { request: Request }) {
  try {
    const session = parseSession(request);
    if (!session) {
      return redirect("/login");
    }

    console.log("USER [dashboard]:", session.userId);

    const {
      findUserById,
      getWalletBalance,
      getUserOrders,
      getUserTransactions,
    } = await import("~/server/db.server");
    const { supabase } = await import("~/server/supabase.server");

    const walletUsd = await getWalletBalance(session.userId);
    console.log("WALLET [dashboard]:", walletUsd);

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
    const startOfToday = new Date(now).setHours(0, 0, 0, 0);
    const cutoff = startOfToday - 13 * DAY_MS;

    let depositsData: { amount_usd_cents: number; created_at: string }[] = [];
    let ordersData: { amount_usd_cents: number; created_at: string }[] = [];

    try {
      const [depositsResult, ordersResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount_usd_cents, created_at")
          .eq("user_id", session.userId)
          .eq("type", "deposit")
          .gte("created_at", cutoff),
        supabase
          .from("orders")
          .select("amount_usd_cents, created_at")
          .eq("user_id", session.userId)
          .gte("created_at", cutoff),
      ]);
      depositsData = depositsResult.data || [];
      ordersData = ordersResult.data || [];
    } catch (chartErr) {
      console.error("[dashboard loader] chart query failed (non-fatal):", chartErr);
    }

    const chartData = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = startOfToday - i * DAY_MS;
      const dayEnd = dayStart + DAY_MS - 1;
      const dateLabel = new Date(dayStart).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      const depsCents = depositsData
        .filter((d) => Number(d.created_at) >= dayStart && Number(d.created_at) <= dayEnd)
        .reduce((sum, d) => sum + Number(d.amount_usd_cents), 0);
      const ordsCents = ordersData
        .filter((d) => Number(d.created_at) >= dayStart && Number(d.created_at) <= dayEnd)
        .reduce((sum, d) => sum + Number(d.amount_usd_cents), 0);
      chartData.push({ date: dateLabel, deposits: depsCents / 100, orders: ordsCents / 100 });
    }

    return Response.json({
      userId:    user.id,
      userEmail: user.email,
      userName:  user.name,
      userRole:  user.role,
      walletUsd,
      walletDisplay:         (walletUsd / 100).toFixed(2),
      totalDepositedUsd:     user.totalDepositedUsd,
      totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2),
      totalOrders:     orders.length,
      pendingOrders,
      completedOrders,
      transactions: transactions.slice(0, 10).map((t) => ({
        id:          t.id,
        type:        t.type,
        amount:      (t.amountUsdCents / 100).toFixed(2),
        balanceAfter:(t.balanceAfterCents / 100).toFixed(2),
        description: t.description,
        createdAt:   t.createdAt,
      })),
      chartData,
    });
  } catch (err) {
    // Re-throw intentional redirects
    if (err instanceof Response) throw err;
    console.error("[user-dashboard.server] loader crashed — returning empty fallback:", err);
    // Return empty safe data so the dashboard renders without crashing
    return Response.json(emptyDashboard("unknown", "unknown"));
  }
}
