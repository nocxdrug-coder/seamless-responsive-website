/**
 * StatsOverview — Dashboard stats cards
 *
 * All data comes from the Remix server loader (passed as props).
 * No client-side fetches, no caching issues, no flash of 0.
 * Balance is always the server-computed value from the transactions table.
 */
import { CreditCard, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import styles from "./stats-overview.module.css";

interface ServerData {
  walletDisplay: string;
  totalDepositedDisplay: string;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

interface Props {
  serverData?: ServerData;
}

export function StatsOverview({ serverData }: Props) {
  // Use server-provided data — always accurate, no stale state
  const walletDisplay    = serverData?.walletDisplay    ?? "...";
  const totalDeposited   = serverData?.totalDepositedDisplay ?? "...";
  const totalOrders      = serverData?.totalOrders      ?? 0;
  const pendingOrders    = serverData?.pendingOrders    ?? 0;
  const completedOrders  = serverData?.completedOrders  ?? 0;

  return (
    <div className={styles.grid}>
      {/* Wallet Balance */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.labelGroup}>
            <span className={styles.label}>Wallet Balance</span>
            <span className={`${styles.currencyBadge} ${styles.currencyUsdt}`}>● USDT</span>
          </div>
          <div className={styles.iconWrap} style={{ background: "rgba(99,102,241,0.2)" }}>
            <CreditCard size={18} color="#818cf8" />
          </div>
        </div>
        <div className={`${styles.value} protected`}>
          ${walletDisplay}
        </div>
      </div>

      {/* Total Deposits */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.labelGroup}>
            <span className={styles.label}>Total Deposits</span>
            <span className={`${styles.currencyBadge} ${styles.currencyUsdt}`}>● USDT</span>
          </div>
          <Link to="/deposit" className={styles.iconWrap} style={{ background: "rgba(34,197,94,0.2)", textDecoration: "none" }}>
            <Plus size={18} color="#22c55e" />
          </Link>
        </div>
        <div className={`${styles.value} protected`}>
          ${totalDeposited}
        </div>
      </div>

      {/* Orders Summary */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.labelGroup}>
            <span className={styles.label}>Orders Summary</span>
          </div>
          <div className={styles.iconWrap} style={{ background: "rgba(168,85,247,0.2)" }}>
            <ShoppingBag size={18} color="#c084fc" />
          </div>
        </div>
        <div className={styles.ordersRow}>
          <div className={styles.orderStat}>
            <span className={`${styles.orderNum} ${styles.orderNumBlue} protected`}>{totalOrders}</span>
            <span className={styles.orderLabel}>Total</span>
          </div>
          <div className={styles.orderStat}>
            <span className={`${styles.orderNum} ${styles.orderNumYellow} protected`}>{pendingOrders}</span>
            <span className={styles.orderLabel}>Pending</span>
          </div>
          <div className={styles.orderStat}>
            <span className={`${styles.orderNum} ${styles.orderNumGreen} protected`}>{completedOrders}</span>
            <span className={styles.orderLabel}>Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
