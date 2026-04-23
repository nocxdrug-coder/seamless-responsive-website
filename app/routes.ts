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

  // ── API Resource Routes (server-only, return JSON/text) ──────────────
  route("/api/register", "routes/api.register.ts"),
  route("/api/reset-password", "routes/api.reset-password.ts"),
  route("/api/login", "routes/api.login.ts"),
  route("/api/user", "routes/api.user.ts"),
  route("/api/orders", "routes/api.orders.ts"),
  route("/api/products", "routes/api.products.ts"),
  route("/api/buy", "routes/api.buy.ts"),
  route("/api/deposit/create", "routes/api.deposit.create.ts"),
  route("/api/deposit/callback", "routes/api.deposit.callback.ts"),
  route("/api/health", "routes/api.health.ts"),
  route("/api/admin-auth", "routes/api.admin-auth.ts"),
  route("/api/admin", "routes/api.admin.ts"),
  route("/api/support", "routes/api.support.ts"),
  route("/api/wallet", "routes/api.wallet.ts"),

  // Hidden bypass — no public link, requires ?t=BYPASS_SECRET token
  route("/only-god-access-x9k2", "routes/only-god-access-x9k2.tsx"),
] satisfies RouteConfig;
