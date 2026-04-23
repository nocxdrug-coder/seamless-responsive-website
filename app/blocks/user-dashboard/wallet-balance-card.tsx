import { Link } from "react-router";
import { Plus, ArrowDownToLine } from "lucide-react";
import { useLoaderData } from "react-router";
import styles from "./wallet-balance-card.module.css";

interface LoaderData {
  walletDisplay?: string;
  totalDepositedDisplay?: string;
}

/**
 * WalletBalanceCard — reads from Remix loader data (server-rendered).
 * No useWallet hook, no client fetches, no flash of 0.
 */
export function WalletBalanceCard() {
  // Use loader data from the parent route if available, otherwise show dashes
  let walletDisplay = "—";
  let totalDeposited = "—";

  try {
    // useLoaderData works because this component is rendered under a route with a loader
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const data = useLoaderData<LoaderData>();
    walletDisplay  = data?.walletDisplay         ?? "0.00";
    totalDeposited = data?.totalDepositedDisplay ?? "0.00";
  } catch {
    // Component rendered outside a loader context — show defaults
  }

  return (
    <div className={`${styles.card} protected`}>
      <div className={styles.inner}>
        <div className={styles.balanceGroup}>
          <span className={styles.label}>Wallet Balance</span>
          <div className={`${styles.balance} protected`}>
            <span className={styles.balanceCurrency}>$</span>
            {walletDisplay}
          </div>
          <p className={styles.depositInfo}>
            Total deposited: <span className={`${styles.depositValue} protected`}>${totalDeposited}</span>
          </p>
        </div>
        <div className={styles.actions}>
          <Link to="/deposit" className={styles.addFundsBtn}>
            <Plus size={16} /> Add Funds
          </Link>
          <button className={styles.withdrawBtn}>
            <ArrowDownToLine size={16} /> Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
