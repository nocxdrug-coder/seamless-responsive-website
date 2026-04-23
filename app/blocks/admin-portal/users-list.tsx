import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./users-list.module.css";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  walletDisplay: string;
  totalDepositedDisplay: string;
  createdAt: number;
}

const PAGE_SIZE = 25;

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "0.65rem 0.85rem" }}>
          <div style={{
            height: "12px", borderRadius: "6px",
            background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            width: i === 0 ? "60%" : i === 2 ? "75%" : "85%",
          }} />
        </td>
      ))}
    </tr>
  );
}

export function UsersList() {
  const [users, setUsers]     = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=users", { credentials: "include" });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON */ }

      if (res.status === 401) {
        setError("Session expired — please log in to the admin panel again.");
        return;
      }
      if (!res.ok) {
        setError(`Error ${res.status}: ${typeof data.error === "string" ? data.error : "Failed to load users. Check server console."}`);
        return;
      }
      setUsers((data.users ?? []) as UserRow[]);
      setPage(0);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  const filtered = useMemo(
    () => users.filter(
      (u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
    ),
    [users, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const pageRows   = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const regularCount = useMemo(() => users.filter((u) => u.role === "user").length, [users]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`}</style>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search by email, name, or User ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{
              width: "100%", padding: "0.5rem 0.75rem 0.5rem 30px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", color: "#fff", fontSize: "0.82rem", outline: "none",
            }}
          />
        </div>
        <button
          onClick={() => void fetchUsers()}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#ccc", padding: "0.5rem 0.9rem", borderRadius: "8px",
            fontSize: "0.75rem", cursor: "pointer", flexShrink: 0,
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: "#ef4444", fontSize: "0.8rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px" }}>
          {error}
        </div>
      )}

      <div className={styles.tableWrap} style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["User ID", "Name", "Email", "Role", "Wallet (USD)", "Total Deposited", "Joined"].map((h) => (
                <th key={h} style={{ padding: "0.65rem 0.85rem", textAlign: "left", color: "#888", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#888", padding: "2.5rem", fontSize: "0.82rem" }}>
                  {search ? "No users match your search." : "No users registered yet."}
                </td>
              </tr>
            ) : (
              pageRows.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.65rem 0.85rem", fontFamily: "monospace", color: "#a78bfa", fontSize: "0.78rem" }}>{u.id}</td>
                  <td style={{ padding: "0.65rem 0.85rem", color: "#e2e8f0" }}>{u.name}</td>
                  <td style={{ padding: "0.65rem 0.85rem", color: "#94a3b8" }}>{u.email}</td>
                  <td style={{ padding: "0.65rem 0.85rem" }}>
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px",
                      background: u.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(34,197,94,0.1)",
                      color: u.role === "admin" ? "#a855f7" : "#4ade80",
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "0.65rem 0.85rem", color: "#4ade80", fontWeight: 700 }}>${u.walletDisplay}</td>
                  <td style={{ padding: "0.65rem 0.85rem", color: "#94a3b8" }}>${u.totalDepositedDisplay}</td>
                  <td style={{ padding: "0.65rem 0.85rem", color: "#64748b", fontSize: "0.75rem" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + count bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ fontSize: "0.72rem", color: "#555" }}>
          {loading ? "Loading…" : `${filtered.length} of ${users.length} user${users.length !== 1 ? "s" : ""} · ${regularCount} regular · page ${safePage + 1}/${totalPages}`}
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


