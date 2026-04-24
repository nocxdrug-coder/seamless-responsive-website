import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ShoppingCart, Trash2, AlertTriangle, ShieldCheck, CheckCircle, CreditCard } from "lucide-react";
import { useCart } from "~/hooks/use-cart";
import { useWallet } from "~/hooks/use-wallet";
import styles from "./my-cart-page.module.css";

interface PurchasedCard {
  cardNumber: string;
  cvv: string;
  expiry: string;
  fullName: string;
  bin: string;
  bank: string;
  provider: string;
  country: string;
  countryFlag: string;
}

interface PurchaseResult {
  orderId: string;
  card: PurchasedCard;
  newBalance: string;
}

export function MyCartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { balanceUsd, isLoading: walletLoading, refresh: refreshWallet } = useWallet();
  const [agreed, setAgreed] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchased, setPurchased] = useState<PurchaseResult[]>([]);

  const walletBalance = parseFloat(balanceUsd) || 0;
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const insufficientBalance = walletBalance < total;

  const handleCompletePurchase = async () => {
    if (!agreed || cart.length === 0) return;
    setPurchaseError("");
    setPurchasing(true);

    const results: PurchaseResult[] = [];
    const failedItems: string[] = [];

    // Purchase items sequentially to avoid race conditions on the server
    for (const item of cart) {
      try {
        const res = await fetch("/api/buy", {
          method: "POST",
          // credentials: "include" sends the HttpOnly session cookie
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.id }),
        });
        const data = await res.json();

        if (res.status === 401) {
          setPurchaseError("Session expired. Please log in again.");
          setPurchasing(false);
          return;
        }

        if (res.ok) {
          results.push({ orderId: data.orderId, card: data.card, newBalance: data.newBalance });
          removeFromCart(item.id);
        } else {
          failedItems.push(`${item.name}: ${data.error ?? "Purchase failed"}`);
        }
      } catch {
        failedItems.push(`${item.name}: Network error`);
      }
    }

    setPurchased(results);
    if (failedItems.length > 0) {
      setPurchaseError(failedItems.join(" | "));
    }
    setPurchasing(false);
    refreshWallet();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/assets/icons/cart-blue.png" className={styles.headerIcon} alt="My cart" />
          <div>
            <h1 className={styles.title}>My Cart</h1>
            <p className={styles.subtitle}>{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</p>
          </div>
        </div>
        <Link to="/cards" className={styles.backBtn}>
          <ArrowLeft size={13} /> Continue Shopping
        </Link>
      </div>

      {/* Purchased Cards Reveal */}
      {purchased.length > 0 && (
        <div className={styles.purchasedWrap}>
          <div className={styles.purchasedHeader}>
            <CheckCircle size={16} color="#22c55e" />
            <span>Purchase Successful! Your card details:</span>
          </div>
          {purchased.map((p) => (
            <div key={p.orderId} className={styles.cardReveal}>
              <div className={styles.cardRevealRow}>
                <CreditCard size={14} color="#818cf8" />
                <span className={styles.cardRevealLabel}>{p.card.provider} {p.card.countryFlag}</span>
              </div>
              <div className={`${styles.cardDetails} card-data`}>
                <div className={styles.cardDetailRow}><span>Card Number:</span><strong>{p.card.cardNumber}</strong></div>
                <div className={styles.cardDetailRow}><span>CVV:</span><strong>{p.card.cvv}</strong></div>
                <div className={styles.cardDetailRow}><span>Expiry:</span><strong>{p.card.expiry}</strong></div>
                <div className={styles.cardDetailRow}><span>Name:</span><strong>{p.card.fullName}</strong></div>
                <div className={styles.cardDetailRow}><span>Bank:</span><strong>{p.card.bank}</strong></div>
              </div>
              <div className={styles.orderIdRow}>Order ID: {p.orderId}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        {/* Cart Items */}
        <div className={styles.cartPanel}>
          <div className={styles.cartPanelHeader}>
            <span className={styles.cartPanelTitle}>Cart Items ({cart.length})</span>
            {cart.length > 0 && (
              <button className={styles.clearBtn} onClick={clearCart} disabled={purchasing}>
                Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 && purchased.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingCart size={32} color="#555" />
              <p>Your cart is empty</p>
              <Link to="/cards" className={styles.shopLink}>Browse Cards</Link>
            </div>
          ) : cart.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle size={32} color="#22c55e" />
              <p>All items purchased! Check your orders.</p>
              <Link to="/orders" className={styles.shopLink}>View Orders</Link>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {cart.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemLeft}>
                    <img
                      src="/assets/icons/card.png"
                      className={styles.itemIcon}
                      alt="Card"
                    />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <div className={styles.itemMeta}>
                        <span className={styles.metaBadge}>{item.brand}</span>
                        <span className={styles.metaBadge}>{item.countryFlag} {item.country}</span>
                        <span className={styles.metaBadge}>{item.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>${isFinite(item.price) ? item.price.toFixed(2) : "0.00"}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                      disabled={purchasing}
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className={styles.summaryPanel}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Wallet Balance</span>
            <span className={styles.summaryBalanceValue}>
              {walletLoading ? "Loading..." : `$${walletBalance.toFixed(2)}`}
            </span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span className={styles.summaryLabel}>Total</span>
            <span className={styles.summaryTotalValue}>${total.toFixed(2)}</span>
          </div>

          {insufficientBalance && cart.length > 0 && (
            <div className={styles.insufficientBanner}>
              <AlertTriangle size={13} />
              Insufficient balance.{" "}
              <Link to="/deposit" className={styles.addFundsLink}>Add funds</Link>
            </div>
          )}

          {purchaseError && (
            <div className={styles.insufficientBanner}>
              <AlertTriangle size={13} />
              {purchaseError}
            </div>
          )}

          <label className={styles.termsRow}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={styles.termsCheck}
              disabled={purchasing}
            />
            <span className={styles.termsText}>
              I agree to the{" "}
              <Link to="/#" className={styles.termsLink}>Terms &amp; Conditions.</Link>
            </span>
          </label>

          <button
            className={styles.purchaseBtn}
            disabled={!agreed || insufficientBalance || cart.length === 0 || purchasing}
            onClick={handleCompletePurchase}
          >
            <ShieldCheck size={14} /> {purchasing ? "Processing..." : "Complete Purchase"}
          </button>
          <p className={styles.purchaseNote}>Order will appear in My Orders</p>
        </div>
      </div>
    </div>
  );
}
