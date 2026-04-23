import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Eye, EyeOff, AlertCircle, Lock } from "lucide-react";

export function AdminLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Authentication failed.");
        return;
      }
      // Admin session cookie is now set — navigate to the hidden admin panel
      navigate("/x7k9-secure-panel-god", { replace: true });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.08) 0%, #0a0a0a 70%)",
      padding: "2rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(230,57,70,0.2)",
        borderRadius: "16px",
        padding: "2.5rem",
        boxShadow: "0 0 40px rgba(230,57,70,0.04)",
      }}>
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px", borderRadius: "12px",
            background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.25)",
            marginBottom: "1rem",
          }}>
            <ShieldCheck size={28} color="#e63946" />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: 0 }}>
            Restricted Access
          </h1>
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
            Admin credentials required
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "0.65rem 0.85rem", borderRadius: "8px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", fontSize: "0.8rem", marginBottom: "1rem",
            }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
              Admin Email
            </label>
            <input
              type="email"
              autoComplete="username"
              placeholder="admin@ccshop.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "0.65rem 0.85rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", color: "#fff", fontSize: "0.88rem", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", color: "#fff", fontSize: "0.88rem", outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "2px",
                }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.75rem",
              background: loading ? "rgba(230,57,70,0.4)" : "rgba(230,57,70,0.85)",
              border: "none", borderRadius: "10px",
              color: "#fff", fontWeight: 700, fontSize: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "background 0.2s",
            }}
          >
            <Lock size={16} />
            {loading ? "Authenticating…" : "Access Admin Panel"}
          </button>
        </form>

        <p style={{ fontSize: "0.7rem", color: "#334155", textAlign: "center", marginTop: "1.5rem" }}>
          This page is restricted. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
