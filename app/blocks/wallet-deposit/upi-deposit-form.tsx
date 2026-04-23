import { useState } from "react";
import { ArrowRight, CheckCircle, ExternalLink } from "lucide-react";
import styles from "./upi-deposit-form.module.css";

const RATE = 95; // INR per USD — must match server lgpay.server.ts INR_PER_USD
const MIN_INR = 2000;

interface DepositState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  payUrl?: string;
  amountUsd?: string;
}

export function UpiDepositForm() {
  const [amount, setAmount] = useState("");
  const [depositState, setDepositState] = useState<DepositState>({ status: "idle", message: "" });

  const numAmount = parseInt(amount, 10) || 0;
  const usdValue = numAmount > 0 ? (numAmount / RATE).toFixed(2) : "0.00";

  // Strict numeric-only: strip anything that isn't a digit (0–9)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  };

  const handleProceed = async () => {
    if (numAmount < MIN_INR) {
      setDepositState({
        status: "error",
        message: `Minimum deposit amount is ${MIN_INR.toLocaleString()} INR`,
      });
      return;
    }

    setDepositState({ status: "loading", message: "Creating secure payment order..." });

    try {
      const res = await fetch("/api/deposit/create", {
        method: "POST",
        // credentials: "include" is CRITICAL — it tells the browser to send the
        // HttpOnly session cookie with the request. Without this, the server
        // sees no cookie and returns 401 even when the user is logged in.
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr: numAmount }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setDepositState({
          status: "error",
          message: "Session expired. Please log in again.",
        });
        return;
      }

      if (!res.ok) {
        setDepositState({
          status: "error",
          message: data.error ?? "Payment gateway error. Please try again.",
        });
        return;
      }

      setDepositState({
        status: "success",
        message: `Order created! You will receive $${data.amountUsd} USD after payment.`,
        payUrl: data.payUrl,
        amountUsd: data.amountUsd,
      });

      // Open payment gateway in new tab automatically
      if (data.payUrl) {
        window.open(data.payUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setDepositState({ status: "error", message: "Network error. Please check your connection." });
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Amount (INR) &mdash; Minimum {MIN_INR.toLocaleString()} INR
        </label>
        <div className={styles.inputWrap}>
          <input
            className={styles.input}
            // Use type="text" with inputMode="numeric" + pattern for strict digits-only.
            // type="number" fights with React controlled string values and shows spinners.
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 2000"
            value={amount}
            onChange={handleChange}
            disabled={depositState.status === "loading"}
            autoComplete="off"
          />
        </div>
      </div>

      <div className={styles.receiveRow}>
        <span className={styles.receiveLabel}>You will receive:</span>
        <span className={styles.receiveValue}>${usdValue} USD</span>
      </div>

      {depositState.status === "error" && (
        <div className={styles.errorMsg}>{depositState.message}</div>
      )}

      {depositState.status === "success" && (
        <div className={styles.successMsg}>
          <CheckCircle size={14} /> {depositState.message}
        </div>
      )}

      <div className={styles.howItWorks}>
        <div className={styles.howHeader}>
          <span className={styles.howIcon}>i</span>
          <span className={styles.howTitle}>How UPI Deposit Works</span>
        </div>
        <ol className={styles.steps}>
          <li>Enter amount in INR (minimum {MIN_INR.toLocaleString()} INR)</li>
          <li>We create a secure UPI Order via LG-Pay gateway</li>
          <li>You&apos;ll be redirected to the payment page</li>
          <li>Complete payment using any UPI app</li>
          <li>USD balance added automatically after confirmation</li>
        </ol>
      </div>

      {depositState.status === "success" && depositState.payUrl ? (
        <a
          href={depositState.payUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.proceedBtn}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <ExternalLink size={16} /> Open Payment Page
        </a>
      ) : (
        <button
          className={styles.proceedBtn}
          onClick={handleProceed}
          disabled={depositState.status === "loading" || numAmount < MIN_INR}
        >
          {depositState.status === "loading" ? (
            "Creating order..."
          ) : (
            <><ArrowRight size={16} /> Proceed to Payment</>
          )}
        </button>
      )}
    </div>
  );
}
