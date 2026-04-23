import { redirect } from "react-router";
import { logIpActivity } from "~/server/ip-security.server";
import { parseSession } from "~/server/session.server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const session = parseSession(request);
  if (!session) {
    logIpActivity(request, { action: "page_access", status: "failed", route: url.pathname });
    const searchParams = new URLSearchParams([["returnTo", url.pathname]]);
    throw redirect(`/login?${searchParams}`);
  }
  logIpActivity(request, { userId: session.userId, action: "page_access", status: "success", route: url.pathname });
  return null;
}
