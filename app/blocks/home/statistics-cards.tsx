import { useLiveStats } from "~/hooks/use-live-stats";
import styles from "./statistics-cards.module.css";

export function StatisticsCards() {
  const { usersDisplay, processedDisplay, uptimeDisplay, countriesDisplay } = useLiveStats();

  const STATS = [
    { value: usersDisplay,     label: "Cards Delivered" },
    { value: processedDisplay, label: "Volume" },
    { value: uptimeDisplay,    label: "Uptime" },
    { value: countriesDisplay, label: "Countries" },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.card}>
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
