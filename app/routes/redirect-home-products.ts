import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export async function loader(_: LoaderFunctionArgs) {
  return redirect("/#cards");
}

export default function RedirectHomeProductsRoute() {
  return null;
}
