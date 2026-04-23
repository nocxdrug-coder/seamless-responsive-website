import { useLiveStats } from "~/hooks/use-live-stats";
import styles from "./user-statistics.module.css";

export function UserStatistics() {
  const { usersDisplay, uptimeDisplay } = useLiveStats();

  const STATS = [
    { value: usersDisplay,  label: "Users" },
    { value: uptimeDisplay, label: "Uptime" },
    { value: "12/7",        label: "Support" }, // static as requested
  ];

  return (
    <div className={styles.wrap}>
      {STATS.map((s) => (
        <div key={s.label} className={styles.stat}>
          <span className={styles.value}>{s.value}</span>
          <span className={styles.label}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
