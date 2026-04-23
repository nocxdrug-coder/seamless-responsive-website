import { LoginForm } from "~/blocks/login/login-form";
import { TrustIndicators } from "~/blocks/login/trust-indicators";
import { PlatformStatistics } from "~/blocks/login/platform-statistics";
import { redirect } from "react-router";
import styles from "./login.module.css";

export { loader } from "~/server/login.server";

export default function LoginPage() {
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
