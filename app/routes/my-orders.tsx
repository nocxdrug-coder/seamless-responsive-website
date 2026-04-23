import { MyOrdersPage } from "~/blocks/my-orders/my-orders-page";
import { Watermark } from "~/components/ui/watermark";
import styles from "./my-orders.module.css";

export default function MyOrders() {
  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <MyOrdersPage />
    </div>
  );
}
