/**
 * IpSecurity â€” Admin "Security / IP Control" tab.
 *
 * Features:
 *   A) Live IP activity feed (last 100 events, auto-refresh every 30s)
 *   B) Ban IP form (IP, reason, permanent/temporary)
 *   C) Banned IP list with Unban action
 *
 * All API calls go through /api/admin (admin-session protected).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield,
  Ban,
  RefreshCw,
  Unlock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import styles from "./ip-security.module.css";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface IpLog {
  id: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  device: string;
  os: string;
  browser: string;
  route: string;
  action: string;
  status: string;
  createdAt: number | string | null;
  createdAtDisplay?: string;
}

interface BannedIp {
  id: string;
  ipAddress: string;
  reason: string;
  bannedBy: string;
  isPermanent: boolean;
  expiresAt: number | null;
  createdAt: number | string | null;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function toEpochMs(value: number | string | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n < 100_000_000_000 ? Math.trunc(n * 1000) : Math.trunc(n);
}

function fmtDate(value: number | string | null | undefined): string {
  const ms = toEpochMs(value);
  if (!ms) return "—";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}


async function adminPost(body: Record<string, unknown>) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function adminGet(action: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`/api/admin?${qs}`);
  return res.json();
}

// â”€â”€â”€ Status chip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "success"  ? styles.chipSuccess  :
    s === "failed"   ? styles.chipFailed   :
    s === "blocked"  ? styles.chipBlocked  :
    styles.chipDefault;
  const icon =
    s === "success"  ? <CheckCircle size={9} /> :
    s === "failed"   ? <AlertTriangle size={9} />:
    s === "blocked"  ? <Ban size={9} />         :
    null;
  return <span className={`${styles.chip} ${cls}`}>{icon} {status || "â€”"}</span>;
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function IpSecurity() {
  // â”€â”€ Activity log state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [logs, setLogs]       = useState<IpLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logFilter, setLogFilter] = useState("");
  const autoRefRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // â”€â”€ Banned IPs state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [bans, setBans]         = useState<BannedIp[]>([]);
  const [bansLoading, setBansLoading] = useState(true);

  // â”€â”€ Ban form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [banIp, setBanIp]       = useState("");
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType]   = useState<"permanent" | "temporary">("permanent");
  const [banHours, setBanHours] = useState("24");
  const [banMsg, setBanMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [banning, setBanning]   = useState(false);

  // â”€â”€ Fetch helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const data = await adminGet("ip_logs", { limit: "150" });
      setLogs(data.logs ?? []);
    } catch { /* silent */ }
    finally { setLogsLoading(false); }
  }, []);

  const fetchBans = useCallback(async () => {
    setBansLoading(true);
    try {
      const data = await adminGet("banned_ips");
      setBans(data.bans ?? []);
    } catch { /* silent */ }
    finally { setBansLoading(false); }
  }, []);

  // â”€â”€ Initial load + auto-refresh every 30s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    void fetchLogs();
    void fetchBans();
    autoRefRef.current = setInterval(() => { void fetchLogs(); }, 30_000);
    return () => { if (autoRefRef.current) clearInterval(autoRefRef.current); };
  }, [fetchLogs, fetchBans]);

  // â”€â”€ Handle Ban â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleBan = async () => {
    const ip = banIp.trim();
    if (!ip) { setBanMsg({ type: "err", text: "Enter an IP address." }); return; }
    if (!banReason.trim()) { setBanMsg({ type: "err", text: "Enter a reason for the ban." }); return; }
    setBanning(true); setBanMsg(null);
    try {
      const expiresAt = banType === "temporary"
        ? Date.now() + Number(banHours) * 60 * 60 * 1000
        : undefined;
      const res = await adminPost({
        action: "ban_ip",
        ip,
        reason: banReason.trim(),
        isPermanent: banType === "permanent",
        expiresAt,
      });
      if (res.success) {
        setBanMsg({ type: "ok", text: `âœ“ ${ip} has been banned.` });
        setBanIp(""); setBanReason(""); setBanType("permanent"); setBanHours("24");
        void fetchBans();
        void fetchLogs();
      } else {
        setBanMsg({ type: "err", text: res.error ?? "Ban failed." });
      }
    } catch {
      setBanMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setBanning(false);
    }
  };

  // â”€â”€ Handle Unban â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleUnban = async (ip: string) => {
    try {
      const res = await adminPost({ action: "unban_ip", ip });
      if (res.success) {
        setBans((prev) => prev.filter((b) => b.ipAddress !== ip));
        setBanMsg({ type: "ok", text: `âœ“ ${ip} has been unbanned.` });
      }
    } catch { /* silent */ }
  };

  // â”€â”€ Populate ban form from activity log row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const prefillBan = (ip: string) => {
    setBanIp(ip);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // â”€â”€ Derived stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalLogs     = logs.length;
  const failedCount   = logs.filter((l) => l.status === "failed").length;
  const blockedCount  = logs.filter((l) => l.status === "blocked").length;
  const bannedCount   = bans.length;

  // â”€â”€ Filtered logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredLogs = logFilter
    ? logs.filter((l) =>
        l.ipAddress.includes(logFilter) ||
        (l.userId ?? "").toLowerCase().includes(logFilter.toLowerCase()) ||
        l.action.toLowerCase().includes(logFilter.toLowerCase()) ||
        l.status.toLowerCase().includes(logFilter.toLowerCase())
      )
    : logs;

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className={styles.wrap}>

      {/* â”€â”€ Stats bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={`${styles.statVal}`}>{totalLogs}</div>
          <div className={styles.statLbl}>Events logged</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statVal} ${styles.statValRed}`}>{failedCount}</div>
          <div className={styles.statLbl}>Failed attempts</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statVal} ${styles.statValAmber}`}>{blockedCount}</div>
          <div className={styles.statLbl}>Blocked (banned IP)</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statVal} ${styles.statValRed}`}>{bannedCount}</div>
          <div className={styles.statLbl}>Active bans</div>
        </div>
      </div>

      {/* â”€â”€ Ban IP Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Ban size={15} />
            Ban IP Address
            <span className={styles.sectionBadge}>Instant</span>
          </div>
        </div>

        {banMsg && (
          <div className={`${styles.msg} ${banMsg.type === "ok" ? styles.msgOk : styles.msgErr}`}>
            {banMsg.text}
          </div>
        )}

        <div className={styles.banForm}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>IP Address</label>
            <input
              className={styles.input}
              placeholder="e.g. 192.168.1.1"
              value={banIp}
              onChange={(e) => setBanIp(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Reason</label>
            <input
              className={styles.input}
              placeholder="Abuse, fraud, brute-forceâ€¦"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Type</label>
            <select
              className={styles.select}
              value={banType}
              onChange={(e) => setBanType(e.target.value as "permanent" | "temporary")}
            >
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
          {banType === "temporary" && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Duration (hours)</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="8760"
                value={banHours}
                onChange={(e) => setBanHours(e.target.value)}
              />
            </div>
          )}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>&nbsp;</label>
            <button
              className={styles.banBtn}
              onClick={handleBan}
              disabled={banning}
            >
              <Ban size={13} />
              {banning ? "Banningâ€¦" : "Block IP"}
            </button>
          </div>
        </div>
      </div>

      {/* â”€â”€ Banned IP List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <AlertTriangle size={15} />
            Banned IPs
            <span className={styles.sectionBadge}>{bannedCount} active</span>
          </div>
          <button className={styles.refreshBtn} onClick={() => void fetchBans()}>
            <RefreshCw size={12} className={bansLoading ? styles.spinning : undefined} />
            Refresh
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Reason</th>
                <th>Duration</th>
                <th>Banned By</th>
                <th>Banned At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bansLoading ? (
                <tr><td colSpan={6} className={styles.empty}>Loadingâ€¦</td></tr>
              ) : bans.length === 0 ? (
                <tr><td colSpan={6} className={styles.empty}>No active bans.</td></tr>
              ) : bans.map((b) => (
                <tr key={b.id}>
                  <td><span className={styles.ipCell}>{b.ipAddress}</span></td>
                  <td>{b.reason || "â€”"}</td>
                  <td>
                    {b.isPermanent ? (
                      <span className={`${styles.chip} ${styles.chipFailed}`}>
                        <Ban size={9} /> Permanent
                      </span>
                    ) : (
                      <span className={`${styles.chip} ${styles.chipBlocked}`}>
                        <Clock size={9} /> Until {b.expiresAt ? fmtDate(b.expiresAt) : "?"}
                      </span>
                    )}
                  </td>
                  <td>{b.bannedBy}</td>
                  <td>{fmtDate(b.createdAt)}</td>
                  <td>
                    <button
                      className={styles.unbanBtn}
                      onClick={() => void handleUnban(b.ipAddress)}
                    >
                      <Unlock size={10} /> Unban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ Live Activity Feed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.sectionTitle}>
            <Activity size={15} />
            Live IP Activity
            <span className={`${styles.sectionBadge} ${styles.sectionBadgeGreen}`}>
              Auto-refresh 30s
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={12}
                style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", color: "#555" }}
              />
              <input
                className={styles.filterInput}
                style={{ paddingLeft: "1.6rem" }}
                placeholder="Filter IP / user / actionâ€¦"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
              />
            </div>
            <button
              className={styles.refreshBtn}
              onClick={() => void fetchLogs()}
            >
              <RefreshCw size={12} className={logsLoading ? styles.spinning : undefined} />
              Refresh
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Device</th>
                <th>OS</th>
                <th>Browser</th>
                <th>User</th>
                <th>Action</th>
                <th>Status</th>
                <th>Time</th>
                <th>Quick Ban</th>
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                <tr><td colSpan={9} className={styles.empty}>Loading activityâ€¦</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={9} className={styles.empty}>
                  {logFilter ? "No results match your filter." : "No activity logged yet. Events will appear here after the first login, registration, or purchase."}
                </td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className={styles.ipCell}>{log.ipAddress}</span>
                  </td>
                  <td style={{ fontSize: "0.78rem" }}>{log.device || "â€”"}</td>
                  <td style={{ fontSize: "0.78rem" }}>{log.os || "â€”"}</td>
                  <td style={{ fontSize: "0.78rem" }}>{log.browser || "â€”"}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#888" }}>
                    {log.userId ?? <span style={{ color: "#444" }}>guest</span>}
                  </td>
                  <td>
                    <span className={styles.actionChip}>{log.action || "â€”"}</span>
                  </td>
                  <td><StatusChip status={log.status} /></td>
                  <td style={{ color: "#555", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                    {log.createdAtDisplay || fmtDate(log.createdAt)}
                  </td>
                  <td>
                    <button
                      className={styles.unbanBtn}
                      style={{ color: "#f87171", borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)" }}
                      onClick={() => prefillBan(log.ipAddress.replace(" (Local Device)", ""))}
                    >
                      <Ban size={10} /> Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

