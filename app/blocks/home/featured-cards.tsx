import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import type { VirtualCard } from "~/data/cards";
import { useAuth } from "~/hooks/use-auth";
import { ProtectedLink } from "~/components/protected-link/protected-link";
import styles from "./featured-cards.module.css";

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
    price: Number(p.price) || 0,
    limit: Number(p.limit) || 0,
    validUntil: p.validUntil,
    inStock: p.status === "in_stock" && qty > 0,
    stock: qty,
    color: p.color || "#3b82f6",
  };
}

export function FeaturedCards() {
  const [featured, setFeatured] = useState<VirtualCard[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) return;
        const list = ((data?.products ?? []) as ApiProductRow[]).map(toVirtualCard).slice(0, 8);
        if (!cancelled) setFeatured(list);
      } catch {
        // ignore
      }
    }
    fetchFeatured();
    const id = window.setInterval(fetchFeatured, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const handleProtectedAction = () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/cards" } });
    }
  };

  return (
    <section id="gallery" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>Featured Cards</h2>
            <p className={styles.subtitle}>Premium cards ready for instant delivery</p>
          </div>
          <ProtectedLink to="/cards" className={styles.viewAll}>
            View All <ArrowRight size={16} />
          </ProtectedLink>
        </div>

        <div className={styles.grid}>
          {featured.map((card) => (
            <div key={card.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon} style={{ background: card.color }}>
                  {card.type[0]}
                </div>
                <div className={styles.inStockBadge}>
                  <span className={styles.inStockDot} />
                  In Stock
                </div>
              </div>

              <div className={styles.cardName}>{card.name}</div>

              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Limit</span>
                  <span className={styles.metaValue}>${card.limit}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Valid Until</span>
                  <span className={styles.metaValue}>{card.validUntil}</span>
                </div>
              </div>

              <div>
                <div className={styles.price}>${card.price.toFixed(2)}</div>
                <div className={styles.priceUnit}>USDT per card</div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.addToCartBtn}
                  onClick={handleProtectedAction}
                  title={isAuthenticated() ? "Add to cart" : "Login to add to cart"}
                >
                  Add to Cart
                </button>
                <button
                  className={styles.buyNowBtn}
                  onClick={handleProtectedAction}
                  title={isAuthenticated() ? "Buy now" : "Login to buy"}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
