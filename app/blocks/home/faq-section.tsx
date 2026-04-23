import { useState } from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";
import styles from "./faq-section.module.css";

const FAQS = [
  {
    q: "How fast is card delivery?",
    a: "Cards are delivered instantly after successful payment verification. You'll receive full card details (number, expiry, CVV) in your dashboard within seconds.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI (QR code payments) and multiple cryptocurrencies including BTC, LTC, TON, and USDT. Minimum deposit is ₹2,000 INR.",
  },
  {
    q: "How secure is the platform?",
    a: "We use 256-bit SSL encryption, bank-level security protocols, MD5 signature verification, and never store sensitive payment information.",
  },
  {
    q: "Can I get a refund?",
    a: "Refunds are considered on a case-by-case basis for unused cards. Once card details are viewed, refunds cannot be processed. Contact support within 24 hours of purchase.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>FAQ</h2>
          <p className={styles.subtitle}>Got questions? We&apos;ve got answers</p>
        </div>
        <div className={styles.list}>
          {FAQS.map((faq, i) => (
            <div key={i} className={classNames(styles.item, { [styles.open]: openIndex === i })}>
              <button className={styles.question} onClick={() => toggle(i)}>
                <span className={styles.questionText}>{faq.q}</span>
                <ChevronDown size={18} className={styles.icon} />
              </button>
              <div className={classNames(styles.answer, { [styles.visible]: openIndex === i })}>
                <p className={styles.answerText}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
