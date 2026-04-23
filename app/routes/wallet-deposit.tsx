import { useState } from "react";
import { type PaymentMethod } from "~/blocks/wallet-deposit/payment-method-selection";
import { WalletDepositCard } from "~/blocks/wallet-deposit/wallet-deposit-card";
import { Watermark } from "~/components/ui/watermark";
import styles from "./wallet-deposit.module.css";

export default function WalletDepositPage() {
  const [method, setMethod] = useState<PaymentMethod>("upi");

  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <WalletDepositCard method={method} onMethodChange={setMethod} />
    </div>
  );
}
