import styles from "./app-background.module.css";

export function AppBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.gradientLayer} />
      <div className={styles.glowLayer} />
      <div className={styles.noiseLayer} />
    </div>
  );
}
