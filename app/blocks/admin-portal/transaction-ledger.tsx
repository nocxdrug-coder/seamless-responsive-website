import { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./transaction-ledger.module.css";

interface OrderRow {
  id: string;
  userEmail: string;
  productName: string;
  amountUsd: string;
  status: string;
  createdAt: number;
}

const PAGE_SIZE = 20;

// Skeleton row for loading state
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div style={{
            height: "12px", borderRadius: "6px",
            background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            width: i === 0 ? "70%" : i === 2 ? "50%" : "85%",
          }} />
        </td>
      ))}
    </tr>
  );
}

export function TransactionLedger() {
  const [orders, setOrders]   = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=orders&limit=200", { credentials: "include" });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON */ }

      if (res.status === 401) {
        setError("Session expired — please log in again.");
        return;
      }
      if (!res.ok) {
        setError(`Error ${res.status}: ${typeof data.error === "string" ? data.error : "Failed to load orders. Check server console."}`);
        return;
      }
      setOrders((data.orders ?? []) as OrderRow[]);
      setPage(0);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  // Memoize filter so it only recomputes when orders/search change
  const filtered = useMemo(
    () => orders.filter(
      (o) =>
        o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        o.productName.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
    ),
    [orders, search]
  );

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages - 1);
  const pageRows    = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const exportCsv = () => {
    const rows = [
      ["Order ID", "User Email", "Product", "Amount (USD)", "Status", "Date"],
      ...filtered.map((o) => [
        o.id, o.userEmail, o.productName, o.amountUsd, o.status,
        new Date(o.createdAt).toLocaleString(),
      ]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.wrap}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`}</style>

      <div className={styles.toolbar}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" }} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by email, product or order ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{ paddingLeft: "30px" }}
          />
        </div>
        <button
          onClick={() => void fetchOrders()}
          disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.72rem", cursor: "pointer" }}
        >
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
        <button className={styles.exportBtn} onClick={exportCsv} disabled={filtered.length === 0}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {error && (
        <div style={{ color: "#ef4444", fontSize: "0.8rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px", marginBottom: "0.75rem" }}>
          {error}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Email</th>
              <th>Product</th>
              <th>Date</th>
              <th>Amount (USD)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#888", padding: "2rem", fontSize: "0.8rem" }}>
                  {search ? "No orders match your search." : "No orders yet."}
                </td>
              </tr>
            ) : (
              pageRows.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#999" }}>{o.id}</td>
                  <td>{o.userEmail}</td>
                  <td>{o.productName}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td><span className={styles.amount}>${o.amountUsd}</span></td>
                  <td>
                    <span className={o.status === "completed" ? styles.statusDelivered : undefined}
                      style={{ textTransform: "capitalize" }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ fontSize: "0.72rem", color: "#666" }}>
          {loading ? "Loading…" : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} · page ${safePage + 1}/${totalPages}`}
        </div>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button
            disabled={safePage === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage === 0 ? 0.35 : 1 }}
          >
            <ChevronLeft size={12} /> Prev
          </button>
          <button
            disabled={safePage >= totalPages - 1 || loading}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage >= totalPages - 1 ? 0.35 : 1 }}
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

