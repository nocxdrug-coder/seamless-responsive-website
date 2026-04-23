/**
 * User Dashboard — Server-Rendered Data
 *
 * All data (wallet balance, orders, transactions) is fetched by the
 * Remix loader on the SERVER before the page is sent to the browser.
 * This completely eliminates:
 *   - client-side fetch() cookie/session issues
 *   - flash of 0 while loading
 *   - stale caches
 *   - race conditions
 *
 * The loader re-runs on every navigation to this page (no stale data).
 */
import { redirect } from "react-router";
import { useLoaderData } from "react-router";
import { ActivityCharts } from "~/blocks/user-dashboard/activity-charts";
import { QuickActions } from "~/blocks/user-dashboard/quick-actions";
import { StatsOverview } from "~/blocks/user-dashboard/stats-overview";
import { Watermark } from "~/components/ui/watermark";
import styles from "./user-dashboard.module.css";

export { loader } from "~/server/user-dashboard.server";
import type { loader } from "~/server/user-dashboard.server";

// ── Page component (uses server data directly) ──────────────────────────────
export default function UserDashboardPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <div className={styles.inner}>
        <StatsOverview serverData={data} />
        <ActivityCharts serverData={data} />
        <QuickActions />
      </div>
    </div>
  );
}
