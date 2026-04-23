import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { DashboardTopNav } from "~/blocks/user-dashboard/dashboard-top-nav";
import { ActionRequiredModal } from "~/blocks/user-dashboard/action-required-modal";
import { useAuth } from "~/hooks/use-auth";

/**
 * AuthGuard layout — wraps all private routes.
 * Verified client-side via API call with credentials.
 */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, refreshUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Client-side auth check
  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage for quick auth check
      if (!isAuthenticated()) {
        const returnTo = encodeURIComponent(location.pathname);
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
        return;
      }

      try {
        // Verify with server
        const data = await refreshUser();
        if (!data) {
          const returnTo = encodeURIComponent(location.pathname);
          navigate(`/login?returnTo=${returnTo}`, { replace: true });
          return;
        }
      } catch {
        const returnTo = encodeURIComponent(location.pathname);
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
        return;
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname, isAuthenticated, refreshUser]);

  if (isChecking) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
        Checking authentication...
      </div>
    );
  }

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
