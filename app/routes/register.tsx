import { RegistrationForm } from "~/blocks/register/registration-form";
import { RegistrationTrustSection } from "~/blocks/register/registration-trust-section";
import { UserStatistics } from "~/blocks/register/user-statistics";
import { redirect } from "react-router";
import styles from "./register.module.css";

export { loader } from "~/server/register.server";

export default function RegisterPage() {
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
