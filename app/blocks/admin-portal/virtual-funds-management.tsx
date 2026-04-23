import { useState } from "react";
import { Search, CheckCircle2, AlertCircle, Plus, Minus, Loader2, Wrench } from "lucide-react";
import styles from "./virtual-funds-management.module.css";

interface FoundUser {
  id: string;
  email: string;
  name: string;
  role: string;
  walletUsd: number;
  walletDisplay: string;
}

interface DiagResult {
  writeOk: boolean;
  summary: string;
  writeError: string | null;
  serviceKey: string;
  fixUrl: string;
}

export function VirtualFundsManagement() {
  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [addAmount, setAddAmount] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [deductAmount, setDeductAmount] = useState("");
  const [deductNote, setDeductNote] = useState("");
  const [deductLoading, setDeductLoading] = useState(false);
  const [deductMsg, setDeductMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [diagResult, setDiagResult] = useState<DiagResult | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const runDiagnose = async () => {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const res = await fetch("/api/admin?action=diagnose", { credentials: "include" });
      if (res.ok) setDiagResult(await res.json() as DiagResult);
      else setDiagResult({ writeOk: false, summary: `HTTP ${res.status}`, writeError: "Could not reach diagnose endpoint", serviceKey: "unknown", fixUrl: "" });
    } catch (e) {
      setDiagResult({ writeOk: false, summary: String(e), writeError: String(e), serviceKey: "unknown", fixUrl: "" });
    } finally {
      setDiagLoading(false);
    }
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setFoundUser(null);
    setAddMsg(null);
    setDeductMsg(null);
    try {
      const res = await fetch(`/api/admin?action=search&q=${encodeURIComponent(q)}`, {
        credentials: "include",
      });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON body */ }

      if (res.status === 401) {
        setSearchError("⚠ Session expired — please log in to the admin panel again.");
        return;
      }
      if (!res.ok) {
        setSearchError(
          typeof data.error === "string"
            ? `Error ${res.status}: ${data.error}`
            : `Server error ${res.status} — check the console.`
        );
        return;
      }
      setFoundUser(data.user as FoundUser);
    } catch (err) {
      // Only reaches here on a true network-level failure (fetch itself threw)
      setSearchError(
        `Network error: ${err instanceof Error ? err.message : String(err)}. ` +
        "Is the dev server running?"
      );
    } finally {
      setSearching(false);
    }
  };

  // ── Adjust wallet helper ──────────────────────────────────────────────────
  const adjustBalance = async (
    type: "add" | "deduct",
    amount: string,
    note: string,
    setLoading: (v: boolean) => void,
    setMsg: (v: { type: "ok" | "err"; text: string } | null) => void
  ) => {
    const val = parseFloat(amount);
    if (!foundUser) return;
    if (isNaN(val) || val <= 0) {
      setMsg({ type: "err", text: "Enter a valid positive amount." });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const currentCents = foundUser.walletUsd;
      const deltaCents = Math.round(val * 100);
      const newBalanceCents =
        type === "add"
          ? currentCents + deltaCents
          : Math.max(0, currentCents - deltaCents);

      console.log(`[funds-mgmt] ${type} userId=${foundUser.id} currentCents=${currentCents} deltaCents=${deltaCents} newBalanceCents=${newBalanceCents} amountUsd=${newBalanceCents / 100}`);

      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_balance",
          userId: foundUser.id,
          amountUsd: newBalanceCents / 100,
          note: note || (type === "add" ? "Admin credit" : "Admin debit"),
        }),
      });

      // Always try to read the body — even error responses have JSON
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON — body will be empty */ }

      console.log(`[funds-mgmt] set_balance HTTP ${res.status}`, data);

      if (res.status === 401) {
        setMsg({ type: "err", text: "⚠ Admin session expired. Please log out and log in again." });
        return;
      }

      if (!res.ok) {
        const errText =
          typeof data.error === "string"
            ? data.error
            : `Server error ${res.status} — check server console for details.`;
        const hint =
          errText.includes("RLS") || errText.includes("row-level security")
            ? " Tip: Add SUPABASE_SERVICE_KEY to your .env file."
            : errText.includes("permission") || res.status === 403
            ? " Tip: The anon key may be blocked by RLS. Add SUPABASE_SERVICE_KEY to .env."
            : "";
        setMsg({ type: "err", text: errText + hint });
        return;
      }

      // Server confirmed the new balance — now re-fetch user from DB to get the live value
      const serverBalance = typeof data.newBalance === "string" ? data.newBalance : null;

      // Re-fetch the user to confirm the DB value (avoids showing stale/calculated balance)
      try {
        const refreshRes = await fetch(
          `/api/admin?action=search&q=${encodeURIComponent(foundUser.id)}`,
          { credentials: "include" }
        );
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json() as { user: FoundUser };
          if (refreshData.user) {
            setFoundUser(refreshData.user);
          }
        }
      } catch {
        // If refresh fails, fall back to server-reported balance
        if (serverBalance) {
          setFoundUser((prev) =>
            prev
              ? { ...prev, walletUsd: Math.round(parseFloat(serverBalance) * 100), walletDisplay: parseFloat(serverBalance).toFixed(2) }
              : prev
          );
        }
      }

      setMsg({
        type: "ok",
        text: `✓ ${type === "add" ? "Added" : "Deducted"} $${val.toFixed(2)}. DB balance: $${serverBalance ?? "check above"}`,
      });
      if (type === "add") { setAddAmount(""); setAddNote(""); }
      else { setDeductAmount(""); setDeductNote(""); }
    } catch (err) {
      // True network failure (fetch threw — server unreachable)
      const msg = err instanceof Error ? err.message : String(err);
      setMsg({ type: "err", text: `Network error: ${msg}. Is the dev server still running?` });
      console.error("[funds-mgmt] fetch threw:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Virtual Funds Management</h2>

      {/* Search */}
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by email or User ID (e.g. USR-1001)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className={styles.searchBtn} onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
          {searching ? "Searching…" : "Search User"}
        </button>
      </div>

      {/* Inline DB write test */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => void runDiagnose()}
          disabled={diagLoading}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "4px 12px", borderRadius: "6px", fontSize: "0.72rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#aaa", cursor: "pointer",
          }}
        >
          <Wrench size={11} style={{ animation: diagLoading ? "spin 1s linear infinite" : "none" }} />
          {diagLoading ? "Testing…" : "Test DB Write"}
        </button>
        {diagResult && (
          <span style={{
            fontSize: "0.75rem",
            color: diagResult.writeOk ? "#4ade80" : "#f87171",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            {diagResult.writeOk
              ? <><CheckCircle2 size={12} /> DB write OK — Add/Deduct should work</>  
              : <>
                  <AlertCircle size={12} />
                  {diagResult.serviceKey === "missing"
                    ? <>SUPABASE_SERVICE_KEY missing in .env — <a href={diagResult.fixUrl} target="_blank" rel="noreferrer" style={{ color: "#93c5fd" }}>Get it here</a>, then restart server</>  
                    : diagResult.writeError ?? diagResult.summary}
                </>}
          </span>
        )}
      </div>

      {searchError && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px" }}>
          <AlertCircle size={14} /> {searchError}
        </div>
      )}

      {/* Found User Card */}
      {foundUser && (
        <>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{foundUser.email}</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className={styles.userId}>ID: {foundUser.id}</span>
                <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "9999px", background: foundUser.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(34,197,94,0.1)", color: foundUser.role === "admin" ? "#a855f7" : "#4ade80", fontWeight: 700 }}>
                  {foundUser.role.toUpperCase()}
                </span>
              </span>
              <span style={{ fontSize: "0.72rem", color: "#888" }}>Name: {foundUser.name}</span>
            </div>
            <div className={styles.userBalance}>${foundUser.walletDisplay}</div>
          </div>

          {/* Actions */}
          <div className={styles.actionRow}>
            {/* Add */}
            <div className={styles.actionGroup}>
              <span className={styles.actionLabel}>
                <Plus size={13} style={{ display: "inline", marginRight: "4px" }} />
                Add USD to Wallet
              </span>
              <div className={styles.amountRow}>
                <input
                  className={styles.amountInput}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount (USD)"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                />
                <button
                  className={styles.addBtn}
                  disabled={addLoading}
                  onClick={() => adjustBalance("add", addAmount, addNote, setAddLoading, setAddMsg)}
                >
                  {addLoading ? "…" : "+ Add"}
                </button>
              </div>
              <textarea
                className={styles.noteInput}
                placeholder="Reason / Note"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
              />
              {addMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: addMsg.type === "ok" ? "#4ade80" : "#ef4444", marginTop: "4px" }}>
                  {addMsg.type === "ok" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  {addMsg.text}
                </div>
              )}
            </div>

            {/* Deduct */}
            <div className={styles.actionGroup}>
              <span className={styles.actionLabel}>
                <Minus size={13} style={{ display: "inline", marginRight: "4px" }} />
                Deduct USD from Wallet
              </span>
              <div className={styles.amountRow}>
                <input
                  className={styles.amountInput}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount (USD)"
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                />
                <button
                  className={styles.deductBtn}
                  disabled={deductLoading}
                  onClick={() => adjustBalance("deduct", deductAmount, deductNote, setDeductLoading, setDeductMsg)}
                >
                  {deductLoading ? "…" : "- Deduct"}
                </button>
              </div>
              <textarea
                className={styles.noteInput}
                placeholder="Reason / Note"
                value={deductNote}
                onChange={(e) => setDeductNote(e.target.value)}
              />
              {deductMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: deductMsg.type === "ok" ? "#4ade80" : "#ef4444", marginTop: "4px" }}>
                  {deductMsg.type === "ok" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  {deductMsg.text}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
