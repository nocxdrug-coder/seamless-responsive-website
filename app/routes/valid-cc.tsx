import { ValidCcNav } from "~/blocks/valid-cc/valid-cc-nav";
import { ValidCcHero } from "~/blocks/valid-cc/valid-cc-hero";
import { ValidCcGrid } from "~/blocks/valid-cc/valid-cc-grid";
import { Watermark } from "~/components/ui/watermark";
import styles from "./valid-cc.module.css";

export default function ValidCcPage() {
  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <ValidCcNav />
      <div className={styles.inner}>
        <ValidCcHero />
        <ValidCcGrid />
      </div>
    </div>
  );
}
