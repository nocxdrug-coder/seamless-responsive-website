import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "~/hooks/use-auth";
import styles from "./registration-form.module.css";

export function RegistrationForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms & Conditions to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        // credentials: "include" ensures the Set-Cookie response from the server
        // is stored by the browser for subsequent authenticated requests.
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      login(data.user);
      navigate("/dashboard");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <Link to="/" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div>
        <h1 className={styles.heading}>Create Account</h1>
        <p className={styles.subheading}>Start your journey with Heaven Card today</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span className={styles.hint}>Must be at least 8 characters long.</span>
        </div>

        <label className={styles.termsRow}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>I have read and agree to the <a href="#" className={styles.termsLink}>Terms &amp; Conditions</a></span>
        </label>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? "Creating account\u2026" : "Create Account"}
        </button>
      </form>

      <p className={styles.loginPrompt}>
        Already have an account?{" "}
        <Link to="/login" className={styles.loginLink}>Sign In</Link>
      </p>
    </div>
  );
}
