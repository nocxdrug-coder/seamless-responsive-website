import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";
import { ADMIN_ENTRY_PATH, ADMIN_LOGIN_PATH, BLOCKED_ADMIN_PATHS } from "./config/admin-routes";

export default [
  // Public pages — include global NavigationHeader + Footer
  layout("routes/public-layout.tsx", [
    index("routes/_index.tsx"),
    route("/login", "routes/login.tsx"),
    route("/register", "routes/register.tsx"),
    route("/reset-password", "routes/reset-password.tsx"),
    route("/support", "routes/support.tsx"),
    route("/features", "routes/redirect-home-features.ts"),
    route("/products", "routes/redirect-home-products.ts"),
  ]),

  // App pages — each has its own sub-navigation (no double nav)
  layout("routes/dashboard-layout.tsx", [
    route("/dashboard", "routes/user-dashboard.tsx"),
    route("/deposit", "routes/wallet-deposit.tsx"),
    route("/cards", "routes/cards-catalog.tsx"),
    route("/valid", "routes/valid-cc.tsx"),
    route("/valid-guarantee", "routes/valid-guarantee.tsx"),
    route("/orders", "routes/my-orders.tsx"),
    route("/history", "routes/transaction-history.tsx"),
    route("/cart", "routes/my-cart.tsx"),
  ]),

  // Admin — standalone hidden routes (not linked anywhere in public UI)
  route(ADMIN_ENTRY_PATH, "routes/admin-landing.tsx"),
  route(ADMIN_LOGIN_PATH, "routes/admin-login.tsx"),
  route(BLOCKED_ADMIN_PATHS.oldPanelEntry, "routes/admin-legacy-panel-entry-redirect.tsx"),
  route(BLOCKED_ADMIN_PATHS.adminRoot, "routes/admin-legacy-redirect.tsx"),
  route(BLOCKED_ADMIN_PATHS.adminLogin, "routes/admin-legacy-login-redirect.tsx"),
  route(BLOCKED_ADMIN_PATHS.hiddenLegacyLogin, "routes/admin-legacy-hidden-login-redirect.tsx"),
  route("/x7k9-secure-panel-god", "routes/admin-portal.tsx"),

  // Hidden bypass — no public link, requires ?t=BYPASS_SECRET token
  route("/only-god-access-x9k2", "routes/only-god-access-x9k2.tsx"),

  // API routes are served by Vercel serverless functions in /api/
  // NOT registered here — SPA mode forbids loader/action exports in route files.
] satisfies RouteConfig;
