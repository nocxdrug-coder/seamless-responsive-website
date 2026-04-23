import { useLiveStats } from "~/hooks/use-live-stats";
import styles from "./platform-statistics.module.css";

export function PlatformStatistics() {
  const { usersDisplay, processedDisplay, countriesDisplay } = useLiveStats();

  const STATS = [
    { value: usersDisplay,     label: "Active Users" },
    { value: processedDisplay, label: "Processed" },
    { value: countriesDisplay, label: "Countries" },
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
