import { redirect } from "react-router";
import { parseSession } from "~/server/session.server";

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const session = parseSession(request);
    if (!session) {
      try {
        const { logIpActivity } = await import("~/server/ip-security.server");
        logIpActivity(request, { action: "page_access", status: "failed", route: url.pathname });
      } catch {
        // ip-security may fail in SPA — non-critical
      }
      const searchParams = new URLSearchParams([["returnTo", url.pathname]]);
      throw redirect(`/login?${searchParams}`);
    }
    try {
      const { logIpActivity } = await import("~/server/ip-security.server");
      logIpActivity(request, { userId: session.userId, action: "page_access", status: "success", route: url.pathname });
    } catch {
      // ip-security may fail in SPA — non-critical
    }
    return null;
  } catch (err) {
    // Re-throw redirect responses — they are intentional control flow
    if (err instanceof Response) throw err;
    console.error("[dashboard-layout.server] loader error:", err);
    throw redirect("/login");
  }
}
