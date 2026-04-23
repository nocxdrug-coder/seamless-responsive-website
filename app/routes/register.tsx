import { useEffect } from "react";
import { useNavigate } from "react-router";
import { RegistrationForm } from "~/blocks/register/registration-form";
import { RegistrationTrustSection } from "~/blocks/register/registration-trust-section";
import { UserStatistics } from "~/blocks/register/user-statistics";
import { useAuth } from "~/hooks/use-auth";
import styles from "./register.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  // Client-side auth check: redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
      return;
    }
    refreshUser().then((data) => {
      if (data) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate, isAuthenticated, refreshUser]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <RegistrationForm />
        <div>
          <RegistrationTrustSection />
          <UserStatistics />
        </div>
      </div>
    </div>
  );
}
