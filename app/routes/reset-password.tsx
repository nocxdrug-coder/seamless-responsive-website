import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle, ArrowRight } from "lucide-react";
import styles from "./reset-password.module.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [totalPurchases, setTotalPurchases] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[reset-password] Form submitted");
    
    if (lockedUntil && Date.now() < lockedUntil) {
      console.warn("[reset-password] Blocked: account locked");
      setError("Account locked. Please try again later.");
      return;
    }

    if (newPassword !== confirmPassword) {
      console.warn("[reset-password] Passwords mismatch");
      setError("Passwords do not match.");
      return;
    }
    
    console.log("[reset-password] Sending via API...");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          createdDate,
          walletBalance: parseFloat(walletBalance) || 0,
          totalPurchases: parseInt(totalPurchases, 10) || 0,
          newPassword
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.lockedUntil) setLockedUntil(data.lockedUntil);
        throw new Error(data.error || "Recovery failed. Your details did not match our records.");
      }
      
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successBox}>
            <CheckCircle size={48} color="#f43f5e" style={{ margin: "0 auto 1rem" }} />
            <h1 className={styles.titleInfo}>Password Reset Successful</h1>
            <p className={styles.subtitleInfo}>Your account has been secured.</p>
            <p className={styles.bodyInfo}>You may now log in with your new credentials.</p>
            <Link to="/login" className={styles.resetBtnHero} style={{ display: "inline-block", marginTop: "2rem", textDecoration: "none" }}>
              Return to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.brandBadge}>
            <img src="/logo.png?v=2" alt="Heaven Card logo" className={styles.brandBadgeLogo} />
            Secure Account Recovery
          </div>
          <h1 className={styles.title}>Reset your password</h1>
          <p className={styles.subtitle}>Please answer a few account questions for identity verification.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!lockedUntil}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Full name (as on account)</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading || !!lockedUntil}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Account created date (YYYY-MM-DD)</label>
            <input
              type="date"
              required
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
              disabled={loading || !!lockedUntil}
            />
            <span className={styles.inputHint}>Enter the date when you first registered your account.</span>
          </div>

          <div className={styles.inputGroup}>
            <label>Account balance (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 12.34"
              value={walletBalance}
              onChange={(e) => setWalletBalance(e.target.value)}
              disabled={loading || !!lockedUntil}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Total purchases (USD / Order Count)</label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 3"
              value={totalPurchases}
              onChange={(e) => setTotalPurchases(e.target.value)}
              disabled={loading || !!lockedUntil}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>New password</label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading || !!lockedUntil}
              minLength={8}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !!lockedUntil}
              minLength={8}
            />
          </div>

          <div className={styles.formFooter}>
            <Link to="/login" className={styles.backLink}>Back to login</Link>
            
            <button
              type="submit"
              className={styles.resetBtn}
              disabled={loading || !!lockedUntil}
            >
              {loading ? "Verifying..." : lockedUntil ? "Account Locked" : "Reset password"}
            </button>
          </div>
          
          <div className={styles.tipBox}>
            Tip: We match email, full name, account creation date, USD wallet balance, and total purchases (up to 2 decimals).
          </div>
        </form>
      </div>
    </main>
  );
}
