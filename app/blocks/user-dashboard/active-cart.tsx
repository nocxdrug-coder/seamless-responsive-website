import { Link } from "react-router";
import { useCart } from "~/hooks/use-cart";
import styles from "./active-cart.module.css";

export function ActiveCart() {
  const { cart } = useCart();
  const items = cart.slice(0, 2);
  const total = cart.reduce((sum, c) => sum + c.price, 0);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Active Cart ({cart.length})</h2>
      <div className={styles.card}>
        {cart.length === 0 ? (
          <div className={styles.emptyState}>Your cart is empty. <Link to="/cards">Browse cards</Link></div>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.itemIcon}>
                    {item.type[0]}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemMeta}>{item.brand} &bull; {item.countryFlag} {item.country}</span>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                  <Link to="/cart" className={styles.removeBtn}>View</Link>
                </div>
              </div>
            ))}
            <div className={styles.footer}>
              <div className={styles.total}>
                <span className={styles.totalLabel}>Cart Total</span>
                <span className={styles.totalValue}>${total.toFixed(2)}</span>
              </div>
              <div className={styles.footerBtns}>
                <Link to="/cards" className={styles.continueBtn}>Continue Shopping</Link>
                <Link to="/cart" className={styles.checkoutBtn}>Proceed to Checkout</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
