import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { parseAdminSession } from "~/server/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = parseAdminSession(request);
    if (session) throw redirect("/x7k9-secure-panel-god");
    return null;
  } catch (err) {
    if (err instanceof Response) throw err;
    console.error("[admin-login.server] loader error:", err);
    return null;
  }
}
