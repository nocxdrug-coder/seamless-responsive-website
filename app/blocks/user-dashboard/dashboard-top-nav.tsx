import { useNavigate, useLocation, Link } from "react-router";
import {
  LayoutDashboard,
  ArrowDownToLine,
  History,
  Package,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "~/hooks/use-auth";
import styles from "./dashboard-top-nav.module.css";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    accentClass: "accentDashboard",
  },
  {
    to: "/deposit",
    label: "Deposit",
    icon: ArrowDownToLine,
    accentClass: "accentDeposit",
  },
  {
    to: "/history",
    label: "History",
    icon: History,
    accentClass: "accentHistory",
  },
  {
    to: "/orders",
    label: "Orders",
    icon: Package,
    accentClass: "accentOrders",
  },
  {
    to: "/cards",
    label: "Shop",
    icon: ShoppingBag,
    accentClass: "accentShop",
  },
  {
    to: "/valid-guarantee",
    label: "100% Valid",
    icon: ShieldCheck,
    accentClass: "accentValid",
  },
  {
    to: "/support",
    label: "Support",
    icon: LifeBuoy,
    accentClass: "accentSupport",
  },
] as const;

export function DashboardTopNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isActive = (to: string) =>
    to === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(to);

  return (
    <header className={styles.header}>
      {/* ── Brand bar ── */}
      <div className={styles.brandBar}>
        <Link to="/dashboard" className={`${styles.brand} logo`}>
          <img src="/logo.png?v=2" alt="Heaven Card logo" className={styles.brandImage} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>Heaven Card</span>
            <span className={styles.brandSub}>Manage your cards &amp; wallet</span>
          </div>
        </Link>
      </div>

      {/* ── Quick Navigation Panel ── */}
      <nav className={styles.navPanel} aria-label="Dashboard navigation">
        <p className={styles.panelLabel}>Quick Navigation</p>
        <div className={styles.btnGrid}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, accentClass }) => (
            <Link
              key={to}
              to={to}
              className={[
                styles.navBtn,
                styles[accentClass],
                isActive(to) ? styles.navBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive(to) ? "page" : undefined}
            >
              <span className={styles.btnIcon}>
                <Icon size={18} strokeWidth={2} />
              </span>
              <span className={styles.btnLabel}>{label}</span>
            </Link>
          ))}

          {/* Logout — button, not a link */}
          <button
            className={`${styles.navBtn} ${styles.accentLogout}`}
            onClick={handleLogout}
            type="button"
          >
            <span className={styles.btnIcon}>
              <LogOut size={18} strokeWidth={2} />
            </span>
            <span className={styles.btnLabel}>Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
