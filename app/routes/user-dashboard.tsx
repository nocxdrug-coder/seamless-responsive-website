/**
 * User Dashboard — Client-Side Data Fetching (SPA Mode)
 *
 * All data is fetched via client-side API calls with credentials: "include"
 * to send HttpOnly cookies automatically.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ActivityCharts } from "~/blocks/user-dashboard/activity-charts";
import { QuickActions } from "~/blocks/user-dashboard/quick-actions";
import { StatsOverview } from "~/blocks/user-dashboard/stats-overview";
import { Watermark } from "~/components/ui/watermark";
import { useAuth } from "~/hooks/use-auth";
import styles from "./user-dashboard.module.css";

interface DashboardData {
  userId: string;
  userEmail: string;
  userName: string | null;
  userRole: string;
  walletUsd: number;
  walletDisplay: string;
  totalDepositedUsd: number;
  totalDepositedDisplay: string;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: string;
    balanceAfter: string;
    description: string;
    createdAt: number;
  }>;
  chartData: Array<{
    date: string;
    deposits: number;
    orders: number;
  }>;
}

// Safe fallback payload when data is not available
function emptyDashboard(): DashboardData {
  return {
    userId: "unknown",
    userEmail: "unknown",
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

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);

  // Client-side auth check and data fetch
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // First check localStorage for quick auth check
      if (!isAuthenticated()) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Fetch user data from API
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login", { replace: true });
            return;
          }
          throw new Error("Failed to fetch user data");
        }
        const userData = await res.json();

        // Update auth context
        refreshUser();

        // Transform API data to DashboardData format
        setData({
          userId: userData.id,
          userEmail: userData.email,
          userName: userData.name,
          userRole: userData.role,
          walletUsd: userData.walletUsd,
          walletDisplay: userData.walletDisplay,
          totalDepositedUsd: userData.totalDepositedUsd,
          totalDepositedDisplay: userData.totalDepositedDisplay,
          totalOrders: 0, // Will be fetched separately if needed
          pendingOrders: 0,
          completedOrders: 0,
          transactions: userData.transactions?.slice(0, 10).map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            balanceAfter: t.balanceAfter,
            description: t.description,
            createdAt: t.createdAt,
          })) || [],
          chartData: [], // Chart data would need separate endpoint
        });
      } catch (err) {
        console.error("[user-dashboard] Error fetching data:", err);
        // Keep showing empty dashboard rather than crashing
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, isAuthenticated, refreshUser]);

  if (isLoading) {
    return (
      <div className={`${styles.page} protected`}>
        <Watermark />
        <div className={styles.inner}>
          <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <div className={styles.inner}>
        <StatsOverview serverData={data} />
        <ActivityCharts serverData={data} />
        <QuickActions />
      </div>
    </div>
  );
}
