/**
 * GET  /api/admin                   → dashboard stats
 * GET  /api/admin?action=users      → all users
 * GET  /api/admin?action=orders     → all orders
 * GET  /api/admin?action=products   → inventory
 * GET  /api/admin?action=search&q=  → search by email/id
 * POST /api/admin                   → balance adjustment, product add/edit, bulk import
 *
 * All logic delegated to the existing server module via a dynamic import
 * using a runtime path string so Vite's static analyzer ignores it.
 */

export default async function handler(req: Request): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const path = [".", ".", "app", "server", "api.admin.server"].join("/");
  const mod = await import(/* @vite-ignore */ path);
  if (req.method === "POST") return mod.action({ request: req });
  return mod.loader({ request: req });
}
