import { parseSession } from "~/server/session.server";

export async function loader({ request }: { request: Request }) {
  const session = parseSession(request);
  return Response.json({ isAuthenticated: !!session });
}
