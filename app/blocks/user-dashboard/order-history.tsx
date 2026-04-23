import { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import styles from "./order-history.module.css";

type ApiOrderRow = {
  id: string;
  status: "pending" | "completed" | "failed" | string;
  amountUsd: string;
  createdAt: number;
  product: { id: string; provider: string; type: string } | null;
};

function SkeletonRow() {
  const cell = (w: string) => (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: "0.85em",
        borderRadius: 4,
        background: "rgba(255,255,255,0.08)",
        animation: "orderPulse 1.4s ease-in-out infinite",
      }}
    />
  );
  return (
    <tr>
      <td>{cell("8rem")}</td>
      <td>{cell("6rem")}</td>
      <td>{cell("4rem")}</td>
      <td>{cell("5rem")}</td>
      <td>{cell("3rem")}</td>
    </tr>
  );
}

export function OrderHistory() {
  const [orders, setOrders] = useState<ApiOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // limit=5 — dashboard widget only shows latest 5 rows
    fetch("/api/orders?limit=5", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => {
        setOrders((data?.orders ?? []) as ApiOrderRow[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        @keyframes orderPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Order History</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Card Name</th>
                <th>Purchase Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#888", padding: "1.25rem", fontSize: "0.85rem" }}>
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className={styles.cardName}>
                        {order.product ? `${order.product.provider} ${order.product.type}` : "N/A"}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toISOString().slice(0, 10)}</td>
                    <td><span className={styles.amount}>${Number(order.amountUsd).toFixed(2)}</span></td>
                    <td>
                      <span
                        className={classNames(
                          styles.statusBadge,
                          order.status === "completed" ? styles.statusDelivered : styles.statusPending
                        )}
                      >
                        {order.status === "completed" ? "Delivered" : order.status}
                      </span>
                    </td>
                    <td><button className={styles.viewBtn}>Details</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
