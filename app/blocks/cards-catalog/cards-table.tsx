import { useNavigate } from "react-router";
import { type VirtualCard } from "~/data/cards";
import { useAuth } from "~/hooks/use-auth";
import { useCart } from "~/hooks/use-cart";
import styles from "./cards-table.module.css";

interface Props {
  cards: VirtualCard[];
}

function normalizeProvider(provider: string | null | undefined): string {
  return String(provider ?? "").trim().toUpperCase() || "UNKNOWN";
}

function maskZip(zip: string | null | undefined): string {
  const value = String(zip ?? "").trim();
  if (!value) return "NO";
  if (value.length <= 2) return value;
  return `${value[0]}***${value[value.length - 1]}`;
}

export function CardsTable({ cards: cardsProp }: Props) {
  const cards = Array.isArray(cardsProp) ? cardsProp : [];
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, addToCart } = useCart();

  const handleBuy = (card: VirtualCard) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    addToCart(card);
    navigate("/cart");
  };

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>BIN</th>
            <th>PROVIDER</th>
            <th>TYPE</th>
            <th>COUNTRY</th>
            <th>STATE</th>
            <th>ADDRESS FLAG</th>
            <th>ZIP</th>
            <th>BANK</th>
            <th>PRICE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.id} className={`${styles.row} card-data`}>
              <td className={styles.bin}>{card.bin}</td>
              <td>
                <span className={styles.provider}>{normalizeProvider(card.provider)}</span>
              </td>
              <td>
                <span className={`${styles.typeBadge} ${card.type === 'CREDIT' ? styles.credit : styles.debit}`}>
                  {card.type}
                </span>
              </td>
              <td>
                <span className={styles.country}>
                  {String(card.country ?? "").trim().toUpperCase()}
                </span>
              </td>
              <td className={styles.state}>{card.state}</td>
              <td>
                <span className={`${styles.booleanBadge} ${card.extras ? styles.booleanYes : styles.booleanNo}`}>
                  {card.extras ? "YES" : "NO"}
                </span>
              </td>
              <td className={styles.zip}>{maskZip(card.zip)}</td>
              <td className={styles.bank}>{card.bank}</td>
              <td>
                <span className={styles.price}>${isFinite(card.price) ? card.price.toFixed(2) : "0.00"}</span>
              </td>
              <td>
                <button
                  className={styles.buyBtn}
                  onClick={() => handleBuy(card)}
                  title={
                    !card.inStock
                      ? "Sold out"
                      : isAuthenticated()
                        ? (cart.some((c) => c.id === card.id) ? "Already in cart" : "Buy card")
                        : "Login to buy"
                  }
                  disabled={!card.inStock || (isAuthenticated() && cart.some((c) => c.id === card.id))}
                >
                  {!card.inStock ? "Sold out" : isAuthenticated() && cart.some((c) => c.id === card.id) ? "In Cart" : "Buy"}
                </button>
              </td>
            </tr>
          ))}
          {cards.length === 0 && (
            <tr>
              <td colSpan={12} className={styles.empty}>No cards match your filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
