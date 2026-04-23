import { Zap, Shield, Headphones } from "lucide-react";
import styles from "./trust-indicators.module.css";

const FEATURES = [
  {
    icon: <Zap size={20} />,
    color: "rgba(34,197,94,0.15)",
    textColor: "#22c55e",
    title: "99.5% Uptime",
    desc: "Always available when you need us",
  },
  {
    icon: <Zap size={20} />,
    color: "rgba(59,130,246,0.15)",
    textColor: "#3b82f6",
    title: "Instant Delivery",
    desc: "Cards delivered in seconds",
  },
  {
    icon: <Shield size={20} />,
    color: "rgba(230,57,70,0.15)",
    textColor: "#e63946",
    title: "Bank-Level Security",
    desc: "Your data is always protected",
  },
  {
    icon: <Headphones size={20} />,
    color: "rgba(249,115,22,0.15)",
    textColor: "#f97316",
    title: "12/7 Support",
    desc: "We\'re here whenever you need help",
  },
];

export function TrustIndicators() {
  return (
    <div className={styles.wrap}>
      <div className={styles.logoRow}>
        <img src="/logo.png?v=2" alt="Heaven Card logo" className={styles.logoImage} />
        <div className={styles.logoText}>
          <span className={styles.logoName}>Heaven Card</span>
          <span className={styles.logoTagline}>Next-Gen Payments</span>
        </div>
      </div>

      <h2 className={styles.heading}>Growing fast with early users</h2>
      <p className={styles.desc}>
        Your secure gateway to premium digital assets with multi-currency support and 24/7 availability.
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
        <span className={styles.paymentLabel}>Accepted Payment Methods</span>
        <div className={styles.paymentBadges}>
          {["UPI", "BTC", "USDT", "LTC"].map((m) => (
            <span key={m} className={styles.paymentBadge}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
