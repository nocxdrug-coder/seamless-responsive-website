import { Link } from "react-router";
import { LogOut } from "lucide-react";
import styles from "./admin-footer.module.css";

export function AdminFooter() {
  const now = new Date().toLocaleString();
  return (
    <div className={styles.footer}>
      <div className={styles.info}>
        <p className={styles.infoText}>Last activity: {now} &bull; Session active</p>
        <p className={styles.warning}>⚠ Keep the admin portal URL strictly confidential</p>
      </div>
      <Link to="/login" className={styles.logoutBtn}>
        <LogOut size={14} /> Quick Logout
      </Link>
    </div>
  );
}
