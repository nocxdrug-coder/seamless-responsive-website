import { Zap, Shield, Globe } from "lucide-react";
import styles from "./why-choose-us.module.css";

const FEATURES = [
  {
    icon: <Zap size={24} />,
    iconClass: styles.iconWrapBlue,
    title: "Lightning Fast",
    desc: "Instant card delivery after payment confirmation. No waiting, no delays.",
  },
  {
    icon: <Shield size={24} />,
    iconClass: styles.iconWrapPurple,
    title: "Bank-Level Security",
    desc: "Advanced encryption and secure payment processing for your peace of mind.",
  },
  {
    icon: <Globe size={24} />,
    iconClass: styles.iconWrapOrange,
    title: "Multi-Currency",
    desc: "Support for UPI, BTC, LTC, TON, and USDT. Pay your way.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Choose Us</h2>
          <p className={styles.subtitle}>Experience the perfect blend of speed, security, and simplicity</p>
        </div>
        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.card}>
              <div className={`${styles.iconWrap} ${f.iconClass}`}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
