import { useEffect, useState } from "react";
import { DollarSign, Users, ShoppingBag, TrendingUp, RefreshCw } from "lucide-react";
import styles from "./analytics-dashboard.module.css";

interface Stats {
  totalRevenue: string;
  totalDeposited: string;
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  productsAvailable: number;
  productsSold: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", { credentials: "include" });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON */ }

      if (res.status === 401) {
        setError("Session expired — please log in to the admin panel again.");
        return;
      }
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? `Error ${res.status}: ${data.error}`
            : `Analytics load failed (HTTP ${res.status}). Check server console.`
        );
        return;
      }
      setStats(data as unknown as Stats);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const cards = stats
    ? [
        {
          icon: <DollarSign size={20} />,
          color: "rgba(34,197,94,0.15)",
          textColor: "#22c55e",
          value: `$${stats.totalRevenue}`,
          label: "Total Earnings",
        },
        {
          icon: <Users size={20} />,
          color: "rgba(59,130,246,0.15)",
          textColor: "#3b82f6",
          value: stats.totalUsers.toString(),
          label: "Registered Users",
        },
        {
          icon: <ShoppingBag size={20} />,
          color: "rgba(249,115,22,0.15)",
          textColor: "#f97316",
          value: stats.productsSold.toString(),
          label: "Cards Sold",
        },
        {
          icon: <TrendingUp size={20} />,
          color: "rgba(168,85,247,0.15)",
          textColor: "#a855f7",
          value: `$${stats.totalDeposited}`,
          label: "Volume Processed",
        },
      ]
    : null;

  return (
    <div className={styles.wrap}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
        <button
          onClick={fetchStats}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#ccc", padding: "0.35rem 0.85rem", borderRadius: "9999px",
            fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px" }}>
          {error}
        </div>
      )}

      <div className={styles.statsGrid}>
        {loading
          ? [1, 2, 3, 4].map((k) => (
              <div key={k} className={styles.statCard} style={{ opacity: 0.4, pointerEvents: "none" }}>
                <div className={styles.statIcon} style={{ background: "rgba(255,255,255,0.05)", color: "#666" }}>
                  <DollarSign size={20} />
                </div>
                <div className={styles.statValue} style={{ color: "#555" }}>—</div>
                <div className={styles.statLabel}>Loading…</div>
              </div>
            ))
          : cards?.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: s.color, color: s.textColor }}>
                  {s.icon}
                </div>
                <div className={styles.statValue} style={{ color: s.textColor }}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
      </div>

      {stats && (
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Order Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", padding: "0.5rem 0" }}>
            {[
              { label: "Total Orders", val: stats.totalOrders },
              { label: "Completed", val: stats.completedOrders },
              { label: "Cards Available", val: stats.productsAvailable },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center", padding: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff" }}>{val}</div>
                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
