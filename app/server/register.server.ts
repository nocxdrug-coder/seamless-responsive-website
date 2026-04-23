import { redirect } from "react-router";
import { parseSession } from "~/server/session.server";

export async function loader({ request }: { request: Request }) {
  try {
    const session = await parseSession(request);
    if (session) {
      return redirect("/dashboard");
    }
    return null;
  } catch (err) {
    console.error("[register.server] loader error:", err);
    return null;
  }
}
