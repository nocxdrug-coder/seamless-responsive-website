import { MyCartPage } from "~/blocks/my-cart/my-cart-page";
import { Watermark } from "~/components/ui/watermark";
import styles from "./my-cart.module.css";

export default function MyCart() {
  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <MyCartPage />
    </div>
  );
}
