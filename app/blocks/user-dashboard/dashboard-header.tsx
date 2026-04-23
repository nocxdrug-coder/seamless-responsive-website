import { LogOut, User } from "lucide-react";
import { Link } from "react-router";
import styles from "./dashboard-header.module.css";

export function DashboardHeader() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.greeting}>
          Welcome back, <span className={styles.greetingAccent}>Alex</span>
        </h1>
        <p className={styles.datetime}>{dateStr}</p>
      </div>
      <div className={styles.right}>
        <div className={styles.profilePill}>
          <div className={styles.avatar}>
            <User size={16} />
          </div>
          <span className={styles.username}>alex@example.com</span>
        </div>
        <Link to="/login" className={styles.logoutBtn}>
          <LogOut size={14} /> Logout
        </Link>
      </div>
    </div>
  );
}
