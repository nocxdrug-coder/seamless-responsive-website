import { useEffect } from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "~/blocks/login/login-form";
import { TrustIndicators } from "~/blocks/login/trust-indicators";
import { PlatformStatistics } from "~/blocks/login/platform-statistics";
import { useAuth } from "~/hooks/use-auth";
import styles from "./login.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  // Client-side auth check: redirect if already logged in
  useEffect(() => {
    // First check localStorage for quick redirect
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
      return;
    }
    // Then verify with server
    refreshUser().then((data) => {
      if (data) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate, isAuthenticated, refreshUser]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <LoginForm />
        <div className={styles.trustPanel}>
          <TrustIndicators />
          <PlatformStatistics />
        </div>
      </div>
    </div>
  );
}
