import { Link } from "react-router";
import classNames from "classnames";
import styles from "./footer-information.module.css";

interface Props {
  className?: string;
}

export function FooterInformation({ className }: Props) {
  return (
    <footer className={classNames(styles.footer, className)}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logoWrap}>
              <img src="/logo.png?v=2" alt="Heaven Card logo" className={styles.logoImage} />
              <span className={styles.logoName}>Heaven Card</span>
            </Link>
            <p className={styles.brandDesc}>
              Next-generation prepaid card marketplace with instant delivery
            </p>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Product</div>
            <a href="/features" className={styles.colLink}>Features</a>
            <a href="/#gateway" className={styles.colLink}>Pricing</a>
            <a href="/#" className={styles.colLink}>API</a>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Company</div>
            <a href="#" className={styles.colLink}>About</a>
            <a href="#" className={styles.colLink}>Terms</a>
            <a href="#" className={styles.colLink}>Privacy</a>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Support</div>
            <a href="#" className={styles.colLink}>Help Center</a>
            <a href="#" className={styles.colLink}>Contact</a>
            <a href="#" className={styles.colLink}>Status</a>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottomRow}>
          <p className={styles.copyright}>&copy; 2026 Heaven Card. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
