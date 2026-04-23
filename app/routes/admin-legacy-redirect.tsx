import type { LoaderFunctionArgs } from "react-router";

export async function loader(_: LoaderFunctionArgs) {
  throw new Response("Not Found", { status: 404, statusText: "Not Found" });
}

export default function AdminLegacyRedirectRoute() {
  return null;
}
