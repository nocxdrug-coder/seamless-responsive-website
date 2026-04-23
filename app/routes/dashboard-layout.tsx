import { Outlet } from "react-router";
import { DashboardTopNav } from "~/blocks/user-dashboard/dashboard-top-nav";
import { ActionRequiredModal } from "~/blocks/user-dashboard/action-required-modal";
export { loader } from "~/server/dashboard-layout.server";

/**
 * AuthGuard layout — wraps all private routes.
 * Verified strictly on the server-side via session cookies.
 */
export default function DashboardLayout() {
  return (
    <>
      <ActionRequiredModal />
      <DashboardTopNav />
      <main className="app-page-shell">
        <Outlet />
      </main>
    </>
  );
}
