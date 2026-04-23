import { TransactionHistoryPage } from "~/blocks/transaction-history/transaction-history-page";
import { Watermark } from "~/components/ui/watermark";
import styles from "./transaction-history.module.css";

export default function TransactionHistory() {
  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <TransactionHistoryPage />
    </div>
  );
}
