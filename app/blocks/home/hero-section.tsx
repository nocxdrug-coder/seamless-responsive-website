import { Link } from "react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ProtectedLink } from "~/components/protected-link/protected-link";
import styles from "./hero-section.module.css";

export function HeroSection({ isAuthenticated }: { isAuthenticated?: boolean }) {
  return (
    <section className={styles.hero}>
      <div className={styles.bgGlow}>
        <div className={styles.glowCircle1} />
        <div className={styles.glowCircle2} />
      </div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Instant Delivery • Auto-Credit
        </div>

        <h1 className={styles.headline}>
          <span className={styles.headlineAccent}>Next-Level</span>
          <span className={styles.headlineMain}>Platinum Prepaid Cards</span>
        </h1>

        <p className={styles.subheading}>
          Experience lightning-fast card delivery with seamless UPI and crypto payments.
          Your wallet, your rules.
        </p>

        <div className={styles.ctas}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.ctaPrimary}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
              <Link to="/cards" className={styles.ctaSecondary}>
                Shop Now
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className={styles.ctaPrimary}>
                Get Started <ArrowRight size={18} />
              </Link>
              <ProtectedLink to="/cards" className={styles.ctaSecondary}>
                Explore Cards
              </ProtectedLink>
            </>
          )}
        </div>

        <div className={styles.trustBadges}>
          <div className={styles.trustItem}>
            <span className={`${styles.trustDot} ${styles.trustDotGreen}`} />
            99.5% Uptime
          </div>
          <div className={styles.trustItem}>
            <span className={`${styles.trustDot} ${styles.trustDotBlue}`} />
            Instant Delivery
          </div>
          <div className={styles.trustItem}>
            <span className={`${styles.trustDot} ${styles.trustDotPurple}`} />
            Crypto Ready
          </div>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <ChevronDown size={20} />
      </div>
    </section>
  );
}
