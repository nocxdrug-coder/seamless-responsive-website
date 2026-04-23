import { useState } from "react";
import { Lock } from "lucide-react";
import classNames from "classnames";
import styles from "./crypto-deposit-form.module.css";

const COINS = [
  { symbol: "USDT(TRC20)", key: "usdt", rate: 1.0 },
  { symbol: "BTC", key: "btc", rate: 1.0 },
  { symbol: "LTC (BEP20)", key: "ltc", rate: 1.0 },
  { symbol: "ETH", key: "eth", rate: 1.0 },
];

const MIN_USD = 25;

export function CryptoDepositForm() {
  const [selectedCoin, setSelectedCoin] = useState("usdt");
  const [amount, setAmount] = useState("");
  const [txnRef, setTxnRef] = useState("");

  const coin = COINS.find((c) => c.key === selectedCoin) ?? COINS[0];
  const numAmount = parseFloat(amount) || 0;
  const approxPay = numAmount > 0 ? `${numAmount.toFixed(4)} ${coin.symbol.split("(")[0].trim()}` : `1 USDT = $1.0000 (live rate)`;

  return (
    <div className={styles.wrap}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Select Cryptocurrency</label>
        <div className={styles.coinBtns}>
          {COINS.map((c) => (
            <button
              key={c.key}
              className={classNames(styles.coinBtn, { [styles.coinBtnActive]: selectedCoin === c.key })}
              onClick={() => setSelectedCoin(c.key)}
            >
              {c.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.amountRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Amount (USD) — Minimum ${MIN_USD}</label>
          <input
            className={styles.input}
            type="text"
            inputMode="decimal"
            placeholder="Enter USD amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>You will pay (approx)</label>
          <div className={styles.approxField}>{approxPay}</div>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Transaction Reference (Optional)</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g., TXN12345 or transaction hash"
          value={txnRef}
          onChange={(e) => setTxnRef(e.target.value)}
        />
      </div>

      <button className={styles.generateBtn}>
        <Lock size={14} /> Generate Deposit Address
      </button>
    </div>
  );
}
