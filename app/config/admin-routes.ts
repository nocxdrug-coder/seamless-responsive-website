/**
 * Single source of truth for the hidden admin entry route.
 * Change only this value to rotate admin entry + login URLs.
 */
export const ADMIN_ENTRY_PATH = "/x9k7-secure-admin-core-portal-88421";

export const ADMIN_LOGIN_PATH = `${ADMIN_ENTRY_PATH}/login`;

export const BLOCKED_ADMIN_PATHS = {
  oldPanelEntry: "/panel-entry",
  adminRoot: "/admin",
  adminLogin: "/admin/login",
  hiddenLegacyLogin: "/x7k9-secure-panel-god/login",
} as const;
