import { Link } from "react-router";
import { ProtectedLink } from "~/components/protected-link/protected-link";
import styles from "./cta-section.module.css";

export function CtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <h2 className={styles.title}>Ready to Get Started?</h2>
          <p className={styles.subtitle}>
            Join thousands of users who trust Heaven Card for their prepaid card needs
          </p>
          <div className={styles.actions}>
            <Link to="/register" className={styles.primaryBtn}>
              Create Free Account
            </Link>
            <ProtectedLink to="/cards" className={styles.secondaryBtn}>
              Browse Cards
            </ProtectedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
