import styles from "./payment-gateway-section.module.css";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" width="22" height="22" fill="none">
        <rect width="48" height="48" rx="10" fill="url(#upiGrad)"/>
        <defs>
          <linearGradient id="upiGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5F3FBD"/>
            <stop offset="1" stopColor="#2E7D32"/>
          </linearGradient>
        </defs>
        <text x="24" y="32" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="sans-serif">UPI</text>
      </svg>
    ),
    bg: "rgba(99,102,241,0.15)",
    title: "UPI Payments",
    desc: "Instant bank-to-wallet via UPI",
  },
  {
    icon: "₿",
    bg: "rgba(249,115,22,0.2)",
    title: "Crypto Payments",
    desc: "BTC, LTC, TON, USDT supported",
  },
  {
    icon: "🔒",
    bg: "rgba(239,68,68,0.2)",
    title: "Secure Processing",
    desc: "MD5 signatures & encrypted data",
  },
];

// UPI SVG logo (inline)
const UpiLogo = () => (
  <svg viewBox="0 0 60 24" width="36" height="16" fill="none">
    <text x="0" y="18" fontSize="16" fontWeight="900" fill="url(#upiG)" fontFamily="sans-serif">UPI</text>
    <defs>
      <linearGradient id="upiG" x1="0" y1="0" x2="60" y2="0">
        <stop stopColor="#5F3FBD"/>
        <stop offset="1" stopColor="#2E7D32"/>
      </linearGradient>
    </defs>
  </svg>
);

// USDT Tether SVG logo (inline)
const UsdtLogo = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.662 0-.814 2.902-1.49 6.79-1.664v2.653c.254.018.982.062 1.988.062 1.207 0 1.812-.05 1.925-.062v-2.652c3.88.173 6.775.85 6.775 1.663 0 .813-2.895 1.49-6.775 1.661zm0-3.59v-2.366h5.414V8h-14.67v3.427h5.414v2.365c-4.4.202-7.708 1.074-7.708 2.12 0 1.046 3.308 1.917 7.708 2.12v7.589h2.842v-7.59c4.392-.202 7.692-1.073 7.692-2.119 0-1.046-3.3-1.917-7.692-2.12z" fill="#fff"/>
  </svg>
);

const PAYMENT_METHODS = [
  {
    icon: <UpiLogo />,
    name: "UPI",
    sub: "Instant",
  },
  { icon: "₿", name: "Bitcoin", sub: "BTC" },
  { icon: "Ł", name: "Litecoin", sub: "LTC" },
  {
    icon: <UsdtLogo />,
    name: "USDT",
    sub: "Tether",
  },
];

export function PaymentGatewaySection() {
  return (
    <section id="gateway" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.left}>
            <h2 className={styles.heading}>
              <span className={styles.headingGradient}>Payment Gateway</span>
            </h2>
            <p className={styles.subtext}>
              Seamless integration with multiple payment methods for instant wallet top-ups
            </p>
            <div className={styles.features}>
              {FEATURES.map((f) => (
                <div key={f.title} className={styles.featureItem}>
                  <div className={styles.featureIcon} style={{ background: f.bg }}>
                    {f.icon}
                  </div>
                  <div className={styles.featureText}>
                    <span className={styles.featureTitle}>{f.title}</span>
                    <span className={styles.featureDesc}>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.paymentMethodsCard}>
              <div className={styles.methodsHeader}>
                <span className={styles.methodsTitle}>Payment Methods</span>
                <span className={styles.allActiveBadge}>
                  <span className={styles.activeDot} />
                  All Active
                </span>
              </div>
              <div className={styles.methodsGrid}>
                {PAYMENT_METHODS.map((m) => (
                  <div key={m.name} className={styles.methodItem}>
                    <div className={styles.methodIcon}>{m.icon}</div>
                    <div className={styles.methodName}>{m.name}</div>
                    <div className={styles.methodSub}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
