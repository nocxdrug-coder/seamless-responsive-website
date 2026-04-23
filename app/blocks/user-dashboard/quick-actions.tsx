import { Link } from "react-router";
import { ArrowDownToLine, ShoppingBag, Package, Receipt } from "lucide-react";
import styles from "./quick-actions.module.css";

const ACTIONS = [
  {
    label: "Add Funds",
    sub: "Top up wallet",
    to: "/deposit",
    icon: <ArrowDownToLine size={20} />,
    bg: "rgba(99,102,241,0.2)",
    color: "#818cf8",
  },
  {
    label: "Buy Cards",
    sub: "Browse shop",
    to: "/cards",
    icon: <ShoppingBag size={20} />,
    bg: "rgba(168,85,247,0.2)",
    color: "#c084fc",
  },
  {
    label: "My Orders",
    sub: "View purchases",
    to: "/orders",
    icon: <Package size={20} />,
    bg: "rgba(34,197,94,0.2)",
    color: "#22c55e",
  },
  {
    label: "Transactions",
    sub: "Full history",
    to: "/history",
    icon: <Receipt size={20} />,
    bg: "rgba(249,115,22,0.2)",
    color: "#f97316",
  },
];

export function QuickActions() {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.grid}>
        {ACTIONS.map((a) => (
          <Link key={a.label} to={a.to} className={styles.actionCard}>
            <div className={styles.actionIconWrap} style={{ background: a.bg, color: a.color }}>
              {a.icon}
            </div>
            <span className={styles.actionLabel}>{a.label}</span>
            <span className={styles.actionSub}>{a.sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
