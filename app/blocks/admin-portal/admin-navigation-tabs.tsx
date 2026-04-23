import { Wallet, Package, BarChart2, FileText, Users, CreditCard, Shield, LifeBuoy } from "lucide-react";
import classNames from "classnames";
import styles from "./admin-navigation-tabs.module.css";

const TABS = [
  { id: "funds",     label: "Virtual Funds",     icon: <Wallet size={16} /> },
  { id: "users",     label: "Users",              icon: <Users size={16} /> },
  { id: "generator", label: "BIN Generator",      icon: <CreditCard size={16} /> },
  { id: "assets",    label: "Asset Management",   icon: <Package size={16} /> },
  { id: "analytics", label: "Analytics",          icon: <BarChart2 size={16} /> },
  { id: "ledger",    label: "Transaction Ledger", icon: <FileText size={16} /> },
  { id: "security",  label: "IP Security",        icon: <Shield size={16} /> },
  { id: "support",   label: "Support Tickets",    icon: <LifeBuoy size={16} /> },
];

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

export function AdminNavigationTabs({ active, onChange }: Props) {
  return (
    <div className={styles.tabs}>
      {TABS.map((t) => (
        <button
          key={t.id}
          className={classNames(styles.tab, { [styles.tabActive]: active === t.id })}
          onClick={() => onChange(t.id)}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
