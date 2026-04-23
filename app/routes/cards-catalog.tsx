import { useEffect, useMemo, useState } from "react";
import type { VirtualCard } from "~/data/cards";
import { CardsFilter } from "~/blocks/cards-catalog/cards-filter";
import { CardsTable } from "~/blocks/cards-catalog/cards-table";
import { TablePagination } from "~/blocks/cards-catalog/table-pagination";
import { Watermark } from "~/components/ui/watermark";
import styles from "./cards-catalog.module.css";

const PAGE_SIZE = 20;

const DEFAULT_FILTERS = {
  bin: "",
  country: "",
  provider: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  fullAddress: false,
};

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
    inStock: (p.status === "in_stock" || p.status === "active") && qty > 0,
    stock: qty,
    color: p.color || "#3b82f6",
    isValid: Boolean(p.is_100_valid ?? p.is_valid ?? false),
    tag: p.tag ?? null,
  };
}

export default function CardsCatalogPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCards() {
      try {
        setLoadError("");
        const res = await fetch("/api/products", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to load products");
        const next = ((data?.products ?? []) as ApiProductRow[]).map(toVirtualCard);
        if (!cancelled) setCards(next);
      } catch {
        if (!cancelled) setLoadError("Could not load cards.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCards();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...cards];
    if (filters.bin) list = list.filter((c) => c.bin.includes(filters.bin));
    if (filters.provider) list = list.filter((c) => c.provider === filters.provider);
    if (filters.type) list = list.filter((c) => c.type === filters.type);
    if (filters.country) list = list.filter((c) => c.country === filters.country);
    if (filters.minPrice) list = list.filter((c) => c.price >= parseFloat(filters.minPrice));
    if (filters.maxPrice) list = list.filter((c) => c.price <= parseFloat(filters.maxPrice));
    if (filters.fullAddress) {
      list = list.filter(
        (c) =>
          (Boolean(c.street?.trim()) && Boolean(c.city?.trim())) ||
          (c.address && c.address !== "N/A" && c.address.length > 3)
      );
    }
    return list;
  }, [cards, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
  };

  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <div className={styles.inner}>
        <CardsFilter filters={filters} onChange={handleFilterChange} onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }} />
        <div className={styles.resultsHeader}>
          <div className={styles.resultsIcon}>
            <img src="/assets/icons/credit-card.png" className={styles.resultsIconImage} alt="Cards" />
          </div>
          <div>
            <div className={styles.resultsCount}>
              {loading ? "Loading cards…" : `Showing ${paginated.length} of ${filtered.length.toLocaleString()} cards`}
            </div>
            <div className={styles.resultsPage}>Page {page} of {totalPages.toLocaleString()}</div>
          </div>
        </div>
        {loadError && (
          <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{loadError}</div>
        )}
        <CardsTable cards={paginated} />
        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
