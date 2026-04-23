import { redirect } from "react-router";
import { parseSession } from "~/server/session.server";

export async function loader({ request }: { request: Request }) {
  const session = await parseSession(request);
  if (session) {
    return redirect("/dashboard");
  }
  return null;
}
