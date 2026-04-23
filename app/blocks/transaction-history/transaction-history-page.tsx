import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, Wallet, CheckCircle, AlertCircle, Inbox, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import styles from "./transaction-history-page.module.css";

interface ApiTransaction {
  id: string;
  type: string;
  amount: string;
  balanceAfter: string;
  description: string;
  createdAt: number;
}

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  purchase: "Purchase",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
};

// Skeleton row placeholder
function SkeletonRow() {
  const cell = (w: string) => (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: "0.85em",
        borderRadius: 4,
        background: "rgba(255,255,255,0.08)",
        animation: "txPulse 1.4s ease-in-out infinite",
      }}
    />
  );
  return (
    <tr>
      <td>{cell("8rem")}</td>
      <td>{cell("4rem")}</td>
      <td>{cell("3.5rem")}</td>
      <td>{cell("3.5rem")}</td>
      <td>{cell("10rem")}</td>
      <td>{cell("5rem")}</td>
    </tr>
  );
}

export function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Use /api/user (now with 5s Cache-Control + parallel fetch internally)
    // Transactions are capped at 50 server-side — fast & bounded
    fetch("/api/user", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { transactions: [] }))
      .then((data) => setTransactions(data.transactions ?? []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = transactions.filter((t) => ["deposit", "admin_credit"].includes(t.type)).length;
  const purchases = transactions.filter((t) => t.type === "purchase").length;

  return (
    <>
      <style>{`
        @keyframes txPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <img src="/assets/icons/transaction.png" className={styles.headerIconImage} alt="Transaction history" />
            </div>
            <div>
              <h1 className={styles.title}>Transaction History</h1>
              <p className={styles.subtitle}>Complete wallet transaction ledger</p>
            </div>
          </div>
          <Link to="/dashboard" className={styles.backBtn}>
            <ArrowLeft size={13} /> Back
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div>
              <p className={styles.statLabel}>Total Transactions</p>
              <p className={styles.statValue}>
                {loading ? "—" : transactions.length}
              </p>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <Wallet size={18} color="#3b82f6" />
            </div>
          </div>
          <div className={styles.statCard}>
            <div>
              <p className={styles.statLabel}>Credits</p>
              <p className={`${styles.statValue} ${styles.statValueGreen}`}>
                {loading ? "—" : completed}
              </p>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <CheckCircle size={18} color="#22c55e" />
            </div>
          </div>
          <div className={styles.statCard}>
            <div>
              <p className={styles.statLabel}>Purchases</p>
              <p className={`${styles.statValue} ${styles.statValueOrange}`}>
                {loading ? "—" : purchases}
              </p>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              <AlertCircle size={18} color="#f97316" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Show 5 skeleton rows while data loads
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className={styles.emptyState}>
                        <Inbox size={32} color="#555" />
                        <p className={styles.emptyTitle}>No transactions yet</p>
                        <p className={styles.emptySubtitle}>Your transaction history will appear here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className={styles.txId}>{tx.id.slice(0, 16)}...</td>
                      <td>
                        <span className={`${styles.typeBadge} ${styles[`type_${tx.type}`]}`}>
                          {tx.type === "purchase" ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                          {TYPE_LABELS[tx.type] ?? tx.type}
                        </span>
                      </td>
                      <td className={tx.type === "purchase" ? styles.amountDebit : styles.amountCredit}>
                        {tx.type === "purchase" ? "-" : "+"}${tx.amount}
                      </td>
                      <td className={styles.balanceAfter}>${tx.balanceAfter}</td>
                      <td className={styles.desc}>{tx.description}</td>
                      <td className={styles.date}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotGreen}`} /> Credit
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotRed}`} /> Purchase
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
