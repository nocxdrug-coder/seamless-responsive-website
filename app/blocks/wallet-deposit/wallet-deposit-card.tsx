import { Link } from "react-router";
import { ArrowLeft, Info } from "lucide-react";
import classNames from "classnames";
import { type PaymentMethod } from "./payment-method-selection";
import { UpiDepositForm } from "./upi-deposit-form";
import { CryptoDepositForm } from "./crypto-deposit-form";
import styles from "./wallet-deposit-card.module.css";

interface Props {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
}

export function WalletDepositCard({ method, onMethodChange }: Props) {
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <img src="/assets/icons/wallet.png" className={styles.iconImage} alt="Wallet deposit" />
          </div>
          <div>
            <div className={styles.title}>Wallet Deposit</div>
            <div className={styles.subtitle}>Add funds to your account</div>
          </div>
        </div>
        <Link to="/dashboard" className={styles.backBtn}>
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      {/* Exchange Rate Banner */}
      <div className={styles.rateBanner}>
        <Info size={14} className={styles.rateIcon} />
        <div>
          <div className={styles.rateTitle}>Exchange Rate Info</div>
          <div className={styles.rateText}>₹95 = $1 USD fixed rate for all UPI deposits</div>
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div className={styles.tabs}>
        <button
          className={classNames(styles.tab, { [styles.tabActive]: method === "upi" })}
          onClick={() => onMethodChange("upi")}
        >
          UPI QR
        </button>
        <button
          className={classNames(styles.tab, { [styles.tabActive]: method === "crypto" })}
          onClick={() => onMethodChange("crypto")}
        >
          Crypto
        </button>
      </div>

      {/* Form Content */}
      {method === "upi" ? <UpiDepositForm /> : <CryptoDepositForm />}

      {/* Footer note */}
      <p className={styles.footerNote}>
        Crypto confirmations ke baad admin approve karega. UPI callbacks auto-approve kar sakte hain.
      </p>
    </div>
  );
}
