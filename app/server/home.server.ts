import { parseSession } from "~/server/session.server";

export async function loader({ request }: { request: Request }) {
  try {
    const session = parseSession(request);
    return Response.json({ isAuthenticated: !!session });
  } catch (err) {
    console.error("[home.server] loader error:", err);
    return Response.json({ isAuthenticated: false });
  }
}
