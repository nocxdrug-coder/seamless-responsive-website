import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Zap, Shield } from "lucide-react";
import { type VirtualCard } from "~/data/cards";
import { useAuth } from "~/hooks/use-auth";
import { useCart } from "~/hooks/use-cart";
import { getCardBrandImage } from "~/utils/card-brand";
import styles from "./valid-cc-grid.module.css";

type ApiProductRow = {
  id: string;
  bin: string;
  provider: string;
  type: string;
  expiry: string;
  name: string;
  country: string;
  countryFlag: string;
  street?: string;
  city?: string;
  state: string;
  address: string;
  zip: string;
  extras: string | null;
  bank: string;
  price: number;
  limit: number;
  validUntil: string;
  color: string;
  status: string;
  cardholder_name?: string | null;
  is_valid?: boolean;
  is_100_valid?: boolean;
  tag?: string | null;
  stock?: number;
};

function toVirtualCard(p: ApiProductRow): VirtualCard {
  const qty = Number(p.stock ?? 0);
  return {
    id: p.id,
    bin: p.bin,
    provider: p.provider,
    type: p.type,
    expiry: p.expiry,
    name: p.name,
    country: p.country,
    countryFlag: p.countryFlag,
    street: p.street,
    city: p.city,
    state: p.state,
    address: p.address,
    zip: p.zip,
    extras: p.extras ?? null,
    bank: p.bank,
    cardholderName: p.cardholder_name ?? null,
    price: Number(p.price) || 0,
    limit: Number(p.limit) || 0,
    validUntil: p.validUntil,
    inStock: p.status === "in_stock" && qty > 0,
    stock: qty,
    color: p.color || "#10154a",
    isValid: Boolean(p.is_100_valid ?? p.is_valid ?? false),
    tag: p.tag ?? null,
  };
}

export function ValidCcGrid() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchValid() {
      try {
        const res = await fetch("/api/products?valid=1", { credentials: "include" });
        if (!res.ok) { if (!cancelled) setLoading(false); return; }
        const data = await res.json().catch(() => ({}));
        const next = (Array.isArray(data?.products) ? data.products as ApiProductRow[] : []).map(toVirtualCard);
        if (!cancelled) setCards(next);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchValid();
    const id = window.setInterval(fetchValid, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const handleBuy = (card: VirtualCard) => {
    if (!card.inStock) return;
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    addToCart(card);
    navigate("/cart");
  };

  return (
    <div className={styles.grid}>
      {loading && cards.length === 0 ? (
        <div style={{ color: "#888", padding: "2rem", fontSize: "0.9rem" }}>Loading…</div>
      ) : cards.length === 0 ? (
        <div style={{ color: "#888", padding: "2rem", fontSize: "0.9rem" }}>No 100% Valid cards available.</div>
      ) : cards.map((card) => (
        <div key={card.id} className={styles.card}>
          <div className={styles.verifiedBadge}>
            <span className={styles.verifiedDot} />
            Verified
          </div>
          <div className={styles.cardImageWrap}>
            <img className={styles.brandLogo} src={getCardBrandImage(card.provider)} alt={card.provider} />
          </div>
          <div className={`${styles.cardInfo} card-data`}>
            <h3 className={styles.cardName}>{card.provider}</h3>
            <div className={styles.cardMeta}>
              <span className={styles.providerTag}>{card.provider.toUpperCase()}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.typeTag}>{card.type}</span>
            </div>
            <p className={styles.description}>
              Instant CC deliver to your Heaven card account after successful payment.
            </p>
            <div className={styles.priceRow}>
              <div>
                <div className={styles.startingFrom}>STARTING FROM</div>
                <div className={styles.price}>${isFinite(card.price) ? card.price.toFixed(2) : "0.00"}</div>
              </div>
              <button
                className={styles.buyBtn}
                onClick={() => handleBuy(card)}
                disabled={!card.inStock}
                title={!card.inStock ? "Sold out" : isAuthenticated() ? "Buy now" : "Login to buy"}
              >
                <ShoppingCart size={12} /> Buy Now
              </button>
            </div>
            <div className={styles.footer}>
              <span className={styles.footerItem}><Zap size={10} /> Instant delivery</span>
              <span className={styles.footerItem}><Shield size={10} /> Secure</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
