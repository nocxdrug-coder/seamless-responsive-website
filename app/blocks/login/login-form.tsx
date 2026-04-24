import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "~/hooks/use-auth";
import { login as loginApi } from "~/services/auth";
import styles from "./login-form.module.css";

export function LoginForm() {
  const location = useLocation();
  const { login } = useAuth();
  // Respect redirect intent set by ProtectedLink (e.g. /cards from "Explore Cards")
  const fromPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginApi(email.trim(), password);
      console.log("Login success:", data);
      login(data.user);
      window.location.href = fromPath;
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection.");
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
        <h1 className={styles.heading}>Welcome Back</h1>
        <p className={styles.subheading}>Sign in to continue your journey</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

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
              placeholder="Enter your password"
              autoComplete="current-password"
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
        </div>

        <div className={styles.rowMeta}>
          <label className={styles.rememberMe}>
            <input type="checkbox" />
            Remember me
          </label>
          <Link to="/reset-password" className={styles.forgotLink}>Forgot password?</Link>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? "Signing in\u2026" : "Sign In"}
        </button>
      </form>

      <p className={styles.registerPrompt}>
        Don&apos;t have an account?{" "}
        <Link to="/register" className={styles.registerLink}>Create account</Link>
      </p>
    </div>
  );
}
