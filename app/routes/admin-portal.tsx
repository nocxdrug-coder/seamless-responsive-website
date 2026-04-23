import { useState, useEffect } from "react";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { AdminHeader } from "~/blocks/admin-portal/admin-header";
import { AdminNavigationTabs } from "~/blocks/admin-portal/admin-navigation-tabs";
import { VirtualFundsManagement } from "~/blocks/admin-portal/virtual-funds-management";
import { AssetManagement } from "~/blocks/admin-portal/asset-management";
import { AnalyticsDashboard } from "~/blocks/admin-portal/analytics-dashboard";
import { TransactionLedger } from "~/blocks/admin-portal/transaction-ledger";
import { UsersList } from "~/blocks/admin-portal/users-list";
import { BinGenerator } from "~/blocks/admin-portal/bin-generator";
import { IpSecurity } from "~/blocks/admin-portal/ip-security";
import { SupportTickets } from "~/blocks/admin-portal/support-tickets";
import { AdminFooter } from "~/blocks/admin-portal/admin-footer";
import { Watermark } from "~/components/ui/watermark";
import { ADMIN_LOGIN_PATH } from "~/config/admin-routes";
import styles from "./admin-portal.module.css";

export { loader } from "~/server/admin-portal.server";


export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState("funds");

  return (
    <div className={`${styles.page} protected`}>
      <Watermark />
      <div className={styles.inner}>
        <AdminHeader />
        <AdminNavigationTabs active={activeTab} onChange={setActiveTab} />
        {activeTab === "funds" && <VirtualFundsManagement />}
        {activeTab === "assets" && <AssetManagement />}
        {activeTab === "analytics" && <AnalyticsDashboard />}
        {activeTab === "ledger" && <TransactionLedger />}
        {activeTab === "users" && <UsersList />}
        {activeTab === "generator" && <BinGenerator />}
        {activeTab === "security" && <IpSecurity />}
        {activeTab === "support" && <SupportTickets />}
        <AdminFooter />
      </div>
    </div>
  );
}
