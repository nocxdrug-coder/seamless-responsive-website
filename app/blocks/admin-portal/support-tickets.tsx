import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, MessageSquare, ExternalLink, X, Send, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import styles from "./support-tickets.module.css";

interface SupportTicket {
  id: string;
  user_id: string;
  issue_type: string;
  subject: string;
  message: string;
  screenshot_url: string | null;
  status: "open" | "answered" | "closed";
  admin_reply: string | null;
  created_at: string;
}

const PAGE_SIZE = 15;

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div style={{
            height: "11px", borderRadius: "6px",
            background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            width: i === 0 ? "60%" : i === 2 ? "40%" : "80%",
          }} />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    open:     { label: "Open",     color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
    answered: { label: "Answered", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    closed:   { label: "Closed",   color: "#71717a", bg: "rgba(113,113,122,0.12)" },
  };
  const s = map[status] ?? map.open;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(0);

  // Modal state
  const [selected, setSelected]   = useState<SupportTicket | null>(null);
  const [reply,    setReply]      = useState("");
  const [sending,  setSending]    = useState(false);
  const [replyMsg, setReplyMsg]   = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=support_tickets", { credentials: "include" });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON */ }
      if (res.status === 401) { setError("Session expired — please log in again."); return; }
      if (!res.ok) { setError(`Error ${res.status}: ${data.error ?? "Failed to load tickets."}`); return; }
      setTickets((data.tickets ?? []) as SupportTicket[]);
      setPage(0);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchTickets(); }, [fetchTickets]);

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setReplyMsg("");
    try {
      const res = await fetch("/api/admin?action=reply_ticket", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply_ticket", ticketId: selected.id, reply: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setReplyMsg(data.error ?? "Failed to send reply."); return; }
      setReplyMsg("✓ Reply sent successfully.");
      setReply("");
      setSelected(null);
      await fetchTickets();
    } catch {
      setReplyMsg("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const filtered = tickets.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.user_id.toLowerCase().includes(search.toLowerCase()) ||
    t.issue_type.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const pageRows   = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className={styles.wrap}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} to{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── Header ── */}
      <div className={styles.toolbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" }} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by subject, user ID, issue type…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{ paddingLeft: "30px" }}
            />
          </div>
          {openCount > 0 && (
            <span style={{ background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "12px", border: "1px solid rgba(244,63,94,0.2)" }}>
              {openCount} open
            </span>
          )}
        </div>
        <button
          onClick={() => void fetchTickets()}
          disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.72rem", cursor: "pointer" }}
        >
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: "#ef4444", fontSize: "0.8rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px", marginBottom: "0.75rem" }}>
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>User ID</th>
              <th>Issue Type</th>
              <th>Subject</th>
              <th>Preview</th>
              <th>Screenshot</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "#888", padding: "2.5rem", fontSize: "0.82rem" }}>
                  {search ? "No tickets match your search." : "No support tickets yet."}
                </td>
              </tr>
            ) : (
              pageRows.map((t) => (
                <tr key={t.id} className={styles.row} style={{ animation: "fadeIn 0.2s ease" }}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#999" }}>
                    {t.id.slice(0, 8)}…
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#aaa" }}>
                    {t.user_id}
                  </td>
                  <td>
                    <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: "10px", fontSize: "0.7rem" }}>
                      {t.issue_type}
                    </span>
                  </td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.status === "open" && (
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#f43f5e", marginRight: 5, verticalAlign: "middle", boxShadow: "0 0 6px #f43f5e" }} />
                    )}
                    {t.subject}
                  </td>
                  <td style={{ maxWidth: 140, fontSize: "0.72rem", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.message.slice(0, 50)}{t.message.length > 50 ? "…" : ""}
                  </td>
                  <td>
                    {t.screenshot_url ? (
                      <a href={t.screenshot_url} target="_blank" rel="noreferrer"
                        style={{ color: "#9333ea", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                        <Eye size={12} /> View
                      </a>
                    ) : (
                      <span style={{ color: "#555", fontSize: "0.7rem" }}>—</span>
                    )}
                  </td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ fontSize: "0.72rem", color: "#888" }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={() => { setSelected(t); setReply(""); setReplyMsg(""); }}
                    >
                      <MessageSquare size={12} /> Reply
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ fontSize: "0.72rem", color: "#666" }}>
          {loading ? "Loading…" : `${filtered.length} ticket${filtered.length !== 1 ? "s" : ""} · page ${safePage + 1}/${totalPages}`}
        </div>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button disabled={safePage === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage === 0 ? 0.35 : 1 }}>
            <ChevronLeft size={12} /> Prev
          </button>
          <button disabled={safePage >= totalPages - 1 || loading} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage >= totalPages - 1 ? 0.35 : 1 }}>
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* ── Detail / Reply Modal ── */}
      {selected && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className={styles.modal}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: 2 }}>
                  Ticket #{selected.id.slice(0, 12)}… · {new Date(selected.created_at).toLocaleString()}
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}>{selected.subject}</div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Meta */}
            <div className={styles.metaRow}>
              <div className={styles.metaItem}><span className={styles.metaLabel}>User ID</span><span className={styles.metaValue} style={{ fontFamily: "monospace" }}>{selected.user_id}</span></div>
              <div className={styles.metaItem}><span className={styles.metaLabel}>Issue Type</span><span className={styles.metaValue}>{selected.issue_type}</span></div>
              <div className={styles.metaItem}><span className={styles.metaLabel}>Status</span><StatusBadge status={selected.status} /></div>
            </div>

            {/* Message */}
            <div className={styles.messageBox}>
              <div className={styles.messageLabel}>User Message</div>
              <div className={styles.messageBody}>{selected.message}</div>
            </div>

            {/* Screenshot */}
            {selected.screenshot_url && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div className={styles.messageLabel} style={{ marginBottom: "0.5rem" }}>Screenshot</div>
                <a href={selected.screenshot_url} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#9333ea", fontSize: "0.82rem", textDecoration: "none", background: "rgba(147,51,234,0.1)", padding: "0.4rem 0.8rem", borderRadius: 8, border: "1px solid rgba(147,51,234,0.2)" }}>
                  <ExternalLink size={13} /> View Attached Screenshot
                </a>
              </div>
            )}

            {/* Existing reply */}
            {selected.admin_reply && (
              <div className={styles.existingReply}>
                <div className={styles.messageLabel} style={{ color: "#4ade80" }}>Previous Admin Reply</div>
                <div style={{ color: "#e5e7eb", fontSize: "0.85rem", marginTop: "0.4rem", lineHeight: 1.6 }}>{selected.admin_reply}</div>
              </div>
            )}

            {/* Reply box */}
            <div className={styles.replySection}>
              <div className={styles.messageLabel}>Admin Reply</div>
              <textarea
                className={styles.replyInput}
                placeholder="Type your reply to the user…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
              />
              {replyMsg && (
                <div style={{ fontSize: "0.8rem", color: replyMsg.startsWith("✓") ? "#4ade80" : "#f87171", marginTop: "0.4rem" }}>
                  {replyMsg}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                <button
                  className={styles.sendBtn}
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                >
                  <Send size={14} />
                  {sending ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
