import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { ADMIN_LOGIN_PATH } from "~/config/admin-routes";
import { parseAdminSession } from "~/server/session.server";

// Server-side allowlist — must match api.admin-auth.ts
const ADMIN_ALLOWLIST = new Set(["forzaxrosan778@gmail.com"]);

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = parseAdminSession(request);
    if (!session) {
      throw redirect(ADMIN_LOGIN_PATH);
    }

    // Pull the user's email and verify they're still in the allowlist
    const { findUserById } = await import("~/server/db.server");
    const user = await findUserById(session.userId).catch(() => null);

    if (!user || user.role !== "admin" || !ADMIN_ALLOWLIST.has(user.email.toLowerCase())) {
      throw redirect(ADMIN_LOGIN_PATH);
    }

    return { adminUserId: session.userId, adminEmail: user.email };
  } catch (err) {
    if (err instanceof Response) throw err;
    console.error("[admin-portal.server] loader error:", err);
    throw redirect(ADMIN_LOGIN_PATH);
  }
}
