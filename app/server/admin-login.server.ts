import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { parseAdminSession } from "~/server/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = parseAdminSession(request);
  if (session) throw redirect("/x7k9-secure-panel-god");
  return null;
}
