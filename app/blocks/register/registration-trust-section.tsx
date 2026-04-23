import { Zap, Shield, CreditCard } from "lucide-react";
import styles from "./registration-trust-section.module.css";

const FEATURES = [
  {
    icon: <Zap size={20} />,
    color: "rgba(59,130,246,0.15)",
    textColor: "#3b82f6",
    title: "Lightning Fast",
    desc: "Instant card delivery after payment confirmation",
  },
  {
    icon: <Shield size={20} />,
    color: "rgba(168,85,247,0.15)",
    textColor: "#a855f7",
    title: "Bank-Level Security",
    desc: "Advanced encryption for your peace of mind",
  },
  {
    icon: <CreditCard size={20} />,
    color: "rgba(230,57,70,0.15)",
    textColor: "#e63946",
    title: "Multi-Payment",
    desc: "UPI, BTC, LTC, TON, and USDT supported",
  },
];

export function RegistrationTrustSection() {
  return (
    <div className={styles.wrap}>
      <div className={styles.logoRow}>
        <img src="/logo.png?v=2" alt="Heaven Card logo" className={styles.logoImage} />
        <div className={styles.logoText}>
          <span className={styles.logoName}>Heaven Card</span>
          <span className={styles.logoTagline}>Next-Gen Payments</span>
        </div>
      </div>

      <h2 className={styles.heading}>Join 1,200+ Early Users on Heaven Card</h2>
      <p className={styles.desc}>
        Experience the fastest way to purchase prepaid cards with instant delivery and secure payment processing.
      </p>

      <div className={styles.featureList}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: f.color, color: f.textColor }}>
              {f.icon}
            </div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>{f.title}</span>
              <span className={styles.featureDesc}>{f.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.paymentRow}>
        <span className={styles.paymentLabel}>Trusted Payment Methods</span>
        <div className={styles.paymentBadges}>
          {["VISA", "Mastercard", "Crypto", "UPI"].map((m) => (
            <span key={m} className={styles.paymentBadge}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
