import { ValidCcHero } from "~/blocks/valid-cc/valid-cc-hero";
import { ValidCcGrid } from "~/blocks/valid-cc/valid-cc-grid";
import { Watermark } from "~/components/ui/watermark";
import styles from "./valid-guarantee.module.css";

export default function ValidGuaranteePage() {
  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <div className={styles.inner}>
        <ValidCcHero />
        <ValidCcGrid />
      </div>
    </div>
  );
}
