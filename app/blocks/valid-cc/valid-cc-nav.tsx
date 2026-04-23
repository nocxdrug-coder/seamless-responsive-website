import { Link } from "react-router";
import { LayoutDashboard, Package, PlusCircle, Search } from "lucide-react";
import styles from "./valid-cc-nav.module.css";

export function ValidCcNav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <div className={styles.brandLogo}>
          <img src="/logo.png?v=2" alt="Heaven Card logo" className={styles.logoImage} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Heaven Card</span>
          <span className={styles.brandSub}>VALID CC MARKETPLACE</span>
        </div>
      </div>
      <div className={styles.searchWrap}>
        <Search size={14} className={styles.searchIcon} />
        <input className={styles.searchInput} type="text" placeholder="Search gift cards..." />
      </div>
      <div className={styles.navBtns}>
        <Link to="/dashboard" className={styles.navBtn}>
          <LayoutDashboard size={13} /> Dashboard
        </Link>
        <Link to="/dashboard" className={styles.navBtn}>
          <Package size={13} /> Orders
        </Link>
        <Link to="/deposit" className={`${styles.navBtn} ${styles.addFundsBtn}`}>
          <PlusCircle size={13} /> Add Funds
        </Link>
      </div>
    </nav>
  );
}
