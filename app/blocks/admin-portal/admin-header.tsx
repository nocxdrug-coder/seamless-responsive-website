import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShieldAlert, LogOut, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { ADMIN_LOGIN_PATH } from "~/config/admin-routes";
import styles from "./admin-header.module.css";

interface DiagnoseResult {
  writeOk: boolean;
  readOk: boolean;
  serviceKey: "set" | "missing";
  summary: string;
  writeError: string | null;
  fixUrl: string;
}

export function AdminHeader() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [sessionStart] = useState(new Date().toLocaleString());
  const [loggingOut, setLoggingOut] = useState(false);

  // Live DB diagnostic
  const [diag, setDiag] = useState<DiagnoseResult | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const runDiagnose = async () => {
    setDiagLoading(true);
    try {
      const res = await fetch("/api/admin?action=diagnose", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as DiagnoseResult;
        setDiag(data);
      }
    } catch {
      // silently ignore — don't block the header render
    } finally {
      setDiagLoading(false);
    }
  };

  useEffect(() => {
    // Fetch admin session info to display real email
    fetch("/api/admin-auth", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.userId) {
          fetch("/api/admin?action=users", { credentials: "include" })
            .then((r) => r.json())
            .then((data) => {
              const me = data.users?.find((u: { id: string; email: string }) => u.id === d.userId);
              if (me) setAdminEmail(me.email);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // Run diagnose on mount
    void runDiagnose();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin-auth?action=logout", { credentials: "include" });
    } catch {
      // Cookie will be cleared on next request anyway
    }
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.warningBadge}>
            <ShieldAlert size={12} /> RESTRICTED ACCESS
          </div>
          <h1 className={styles.title}>Admin Control Panel</h1>
          <p className={styles.sessionInfo}>
            Session started: {sessionStart} &bull; Keep this URL confidential
          </p>
        </div>
        <div className={styles.right}>
          {/* DB status pill */}
          {diag && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "0.68rem",
                fontWeight: 700,
                background: diag.writeOk
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(239,68,68,0.12)",
                color: diag.writeOk ? "#4ade80" : "#f87171",
                border: `1px solid ${diag.writeOk ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              {diag.writeOk
                ? <><CheckCircle2 size={11} /> DB OK</>
                : <><AlertTriangle size={11} /> DB WRITE ERROR</>}
            </div>
          )}
          <div className={styles.adminPill}>
            <span className={styles.adminDot} />
            {adminEmail ?? "admin"}
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={14} /> {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>

      {/* ── Critical: DB write permission banner ── */}
      {diag && !diag.writeOk && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "0.85rem 1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            margin: "0 0 1rem 0",
            lineHeight: 1.5,
          }}
        >
          <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem", marginBottom: "4px" }}>
              ⚠ Database Write Permission Error — Add/Deduct will fail
            </div>
            <div style={{ color: "#fca5a5", fontSize: "0.78rem" }}>
              {diag.writeError
                ? <><strong>Error:</strong> {diag.writeError}<br /></>
                : null}
              {diag.serviceKey === "missing"
                ? <>
                    <strong>Fix:</strong> Add <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>SUPABASE_SERVICE_KEY</code> to your
                    {" "}<code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>.env</code> file.
                    {" "}Get it from{" "}
                    <a href={diag.fixUrl} target="_blank" rel="noreferrer"
                      style={{ color: "#93c5fd", textDecoration: "underline" }}>
                      Supabase → Settings → API → service_role key
                    </a>.
                    {" "}Then restart the dev server.
                  </>
                : <>{diag.summary}</>}
            </div>
          </div>
          <button
            onClick={() => void runDiagnose()}
            disabled={diagLoading}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "6px",
              color: "#aaa",
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={11} style={{ animation: diagLoading ? "spin 1s linear infinite" : "none" }} />
            Re-check
          </button>
        </div>
      )}

      {/* ── Success banner (briefly shown) ── */}
      {diag?.writeOk && (
        <div
          style={{
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: "10px",
            padding: "0.55rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            margin: "0 0 0.75rem 0",
            fontSize: "0.75rem",
            color: "#4ade80",
          }}
        >
          <CheckCircle2 size={14} />
          Database write permissions OK — Add/Deduct is fully operational.
        </div>
      )}
    </>
  );
}
