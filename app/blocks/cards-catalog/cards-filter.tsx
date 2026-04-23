import { Filter } from "lucide-react";
import styles from "./cards-filter.module.css";

interface Filters {
  bin: string;
  country: string;
  provider: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  fullAddress: boolean;
}

interface Props {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  onReset: () => void;
}

export function CardsFilter({ filters, onChange, onReset }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Filter size={14} className={styles.filterIcon} />
        <span className={styles.title}>Filter Cards</span>
      </div>
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>BIN / SKU</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Search BIN..."
            value={filters.bin}
            onChange={(e) => onChange({ bin: e.target.value })}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Country</label>
          <select className={styles.select} value={filters.country} onChange={(e) => onChange({ country: e.target.value })}>
            <option value="">All Countries</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Provider</label>
          <select className={styles.select} value={filters.provider} onChange={(e) => onChange({ provider: e.target.value })}>
            <option value="">All Providers</option>
            <option value="VISA">VISA</option>
            <option value="MASTERCARD">MASTERCARD</option>
            <option value="AMEX">AMEX</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Type</label>
          <select className={styles.select} value={filters.type} onChange={(e) => onChange({ type: e.target.value })}>
            <option value="">All Types</option>
            <option value="DEBIT">DEBIT</option>
            <option value="CREDIT">CREDIT</option>
          </select>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Min Price ($)</label>
          <input
            className={styles.input}
            type="number"
            placeholder="0.00"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Max Price ($)</label>
          <input
            className={styles.input}
            type="number"
            placeholder="999.00"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
          />
        </div>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={filters.fullAddress}
              onChange={(e) => onChange({ fullAddress: e.target.checked })}
            />
            Full Address
          </label>
        </div>
        <div className={styles.actionBtns}>
          <button className={styles.applyBtn} onClick={() => onChange({})}>Apply</button>
          <button className={styles.resetBtn} onClick={onReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}
