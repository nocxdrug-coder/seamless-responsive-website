import { CheckCircle, Zap, Shield, RefreshCcw } from "lucide-react";
import styles from "./valid-cc-hero.module.css";

const BADGES = [
  { icon: CheckCircle, label: "100% Valid Cards" },
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "Secure Payment" },
  { icon: RefreshCcw, label: "100% Refundable*" },
];

export function ValidCcHero() {
  return (
    <div className={styles.wrap}>
      <div className={styles.textGroup}>
        <h1 className={styles.title}>100% Valid CC Guaranteed</h1>
        <p className={styles.subtitle}>Instant digital delivery • Secure wallet payment • 100% Valid</p>
      </div>
      <div className={styles.allVerifiedBadge}>
        <span className={styles.greenDot} />
        All Cards Verified
      </div>
      <div className={styles.badges}>
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className={styles.badge}>
            <Icon size={13} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
