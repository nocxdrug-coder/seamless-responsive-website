/**
 * /only-god-access-x9k2 â€” Hidden admin bypass panel.
 *
 * NOT linked anywhere in the UI. Access only via direct secret URL.
 * Protected by TWO layers:
 *   1. BYPASS_SECRET env token  â€” query param ?t=TOKEN
 *   2. Admin role session       â€” must be logged in as admin
 *
 * If either check fails: renders a convincing 404 (no 401/403 that reveals the page exists).
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { ADMIN_ENTRY_PATH } from "~/config/admin-routes";

// Define the type locally since we can't import it from the server file directly in UI
type LockedAccount = {
  id: string;
  email: string;
  failedAttempts: number;
  lockedUntil: number;
  remainingMs: number;
};

// Also define the constants locally to avoid importing from server
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 10 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export { loader, action } from "~/server/only-god-access.server";
import type { loader } from "~/server/only-god-access.server";

// â”€â”€â”€ Client: Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function GodBypassPage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ ok: boolean; message?: string; error?: string }>();

  // Not authorized â€” render a convincing 404
  if (!data.authorized && !("needsAdminLogin" in data && data.needsAdminLogin)) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080808", color: "#fff",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ fontSize: "7rem", fontWeight: 900, color: "#111", lineHeight: 1 }}>404</div>
        <div style={{ fontSize: "1rem", color: "#333", marginTop: "1rem" }}>Page not found.</div>
      </div>
    );
  }

  // Has valid token but no admin session
  if (!data.authorized && "needsAdminLogin" in data && data.needsAdminLogin) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.04) 0%, #080808 60%)",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          maxWidth: "420px", width: "100%", padding: "2.5rem",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px", textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>ðŸ”</div>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 800 }}>Admin Session Required</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
            You must be logged in as an <strong style={{ color: "#eab308" }}>admin</strong> to use this panel.
            Login at the admin portal, then return here with the same token.
          </p>
          <a
            href={ADMIN_ENTRY_PATH}
            style={{
              display: "inline-block", padding: "0.65rem 1.5rem",
              background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.35)",
              borderRadius: "10px", color: "#fbbf24", fontWeight: 700,
              fontSize: "0.85rem", textDecoration: "none",
            }}
          >
            â†’ Go to Admin Entry
          </a>
        </div>
      </div>
    );
  }

  // Fully authorized
  const { token, adminId, lockedAccounts } = data as {
    authorized: true; token: string; adminId: string; lockedAccounts: LockedAccount[];
  };
  const isPending = fetcher.state !== "idle";
  const result    = fetcher.data;
  const lockMins  = LOCK_DURATION_MS / 60000;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.07) 0%, #080808 65%)",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#e2e8f0",
      padding: "2rem 1rem",
    }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "68px", height: "68px", borderRadius: "18px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            marginBottom: "1.2rem", fontSize: "2rem",
          }}>ðŸ”“</div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            God Mode â€” Admin Bypass
          </h1>
          <p style={{ fontSize: "0.78rem", color: "#475569", marginTop: "6px" }}>
            Account unlock panel Â· Admin: <code style={{ color: "#94a3b8" }}>{adminId}</code>
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
          marginBottom: "1.5rem",
        }}>
          {[
            { label: "Max Attempts", value: String(MAX_FAILED_ATTEMPTS), color: "#f59e0b" },
            { label: "Lock Duration", value: `${lockMins} min`, color: "#ef4444" },
            { label: "Locked Now", value: String(lockedAccounts.length), color: lockedAccounts.length > 0 ? "#ef4444" : "#22c55e" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "1.1rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Unlock by email */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px", padding: "1.75rem", marginBottom: "1.25rem",
        }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#94a3b8", marginTop: 0, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Unlock Account by Email
          </h2>

          <fetcher.Form method="POST" style={{ display: "flex", gap: "10px" }}>
            <input type="hidden" name="token" value={token} />
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              style={{
                flex: 1, padding: "0.7rem 1rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#fff", fontSize: "0.88rem", outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: "0.7rem 1.5rem",
                background: isPending ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.75)",
                border: "1px solid rgba(239,68,68,0.5)",
                borderRadius: "10px", color: "#fff", fontWeight: 700,
                fontSize: "0.85rem", cursor: isPending ? "default" : "pointer",
                whiteSpace: "nowrap", transition: "background 0.2s",
              }}
            >
              {isPending ? "Unlockingâ€¦" : "Unlock Account"}
            </button>
          </fetcher.Form>

          {result && (
            <div style={{
              marginTop: "0.85rem", padding: "0.7rem 1rem", borderRadius: "9px",
              background: result.ok ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
              border: `1px solid ${result.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              color: result.ok ? "#86efac" : "#fca5a5", fontSize: "0.85rem",
            }}>
              {result.ok ? result.message : `âš  ${result.error}`}
            </div>
          )}
        </div>

        {/* Locked accounts list */}
        <div style={{
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px", padding: "1.75rem",
        }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#94a3b8", marginTop: 0, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Currently Locked Accounts ({lockedAccounts.length})
          </h2>

          {lockedAccounts.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155", fontSize: "0.85rem" }}>
              <span style={{ fontSize: "1.1rem" }}>âœ…</span> No accounts are currently locked.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {lockedAccounts.map((acc) => (
                <div key={acc.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.13)",
                  borderRadius: "11px", gap: "12px", flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fca5a5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {acc.email}
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#64748b", marginTop: "3px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span>{acc.failedAttempts} failed attempt{acc.failedAttempts !== 1 ? "s" : ""}</span>
                      <span>Â·</span>
                      <span style={{ color: "#ef4444" }}>{formatMs(acc.remainingMs)} remaining</span>
                      <span>Â·</span>
                      <span style={{ opacity: 0.5 }}>{acc.id}</span>
                    </div>
                  </div>
                  <fetcher.Form method="POST" style={{ margin: 0, flexShrink: 0 }}>
                    <input type="hidden" name="token" value={token} />
                    <input type="hidden" name="email" value={acc.email} />
                    <button
                      type="submit"
                      disabled={isPending}
                      style={{
                        padding: "0.43rem 0.9rem",
                        background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "8px", color: "#fca5a5", fontWeight: 700,
                        fontSize: "0.78rem", cursor: "pointer",
                      }}
                    >
                      Unlock
                    </button>
                  </fetcher.Form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{ fontSize: "0.68rem", color: "#1e293b", textAlign: "center", marginTop: "2rem" }}>
          This panel is not linked in any UI. Access requires valid BYPASS_SECRET token + admin session.
        </p>

      </div>
    </div>
  );
}

