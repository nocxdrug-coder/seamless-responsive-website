import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ShoppingBag, Filter, RotateCcw, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./my-orders-page.module.css";

const STATUS_OPTIONS = ["All Statuses", "completed", "pending", "failed"];
const STATUS_LABELS: Record<string, string> = {
  "All Statuses": "All Statuses",
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

interface ApiOrder {
  id: string;
  status: string;
  amountUsd: string;
  createdAt: number;
  product: { provider: string; type: string; country: string; countryFlag: string; bank: string } | null;
  cardDetails: { cardNumber: string; cvv: string; expiry: string; fullName: string; bin: string; bank: string } | null;
}

export function MyOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    statusFilter === "All Statuses" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Orders</h1>
            <p className={styles.subtitle}>{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
          </div>
          <div className={styles.headerActions}>
            <select
              className={styles.statusSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button className={styles.resetBtn} onClick={() => setStatusFilter("All Statuses")}>
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyCard}>
            <p className={styles.emptySubtitle}>Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <ShoppingBag size={28} color="#666" />
            </div>
            <p className={styles.emptyTitle}>No orders yet</p>
            <p className={styles.emptySubtitle}>Your order history will appear here</p>
            <Link to="/cards" className={styles.shopBtn}>
              <ShoppingBag size={14} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filtered.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div
                  className={styles.orderRow}
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className={styles.orderLeft}>
                    <div className={styles.orderIcon}>
                      <CreditCard size={14} color="#818cf8" />
                    </div>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderName}>
                        {order.product ? `${order.product.countryFlag} ${order.product.provider} ${order.product.type}` : "Card Purchase"}
                      </span>
                      <span className={styles.orderId}>{order.id}</span>
                    </div>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.orderAmount}>${order.amountUsd}</span>
                    <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {order.cardDetails && (
                      expandedId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </div>

                {expandedId === order.id && order.cardDetails && (
                  <div className={styles.cardReveal}>
                    <div className={`${styles.cardDetails} card-data`}>
                      <div className={styles.cardDetailItem}><span>Card Number</span><strong>{order.cardDetails.cardNumber}</strong></div>
                      <div className={styles.cardDetailItem}><span>CVV</span><strong>{order.cardDetails.cvv}</strong></div>
                      <div className={styles.cardDetailItem}><span>Expiry</span><strong>{order.cardDetails.expiry}</strong></div>
                      <div className={styles.cardDetailItem}><span>Name</span><strong>{order.cardDetails.fullName}</strong></div>
                      <div className={styles.cardDetailItem}><span>Bank</span><strong>{order.cardDetails.bank}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
