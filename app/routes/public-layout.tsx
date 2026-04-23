import { Outlet, useLoaderData } from "react-router";
import { NavigationHeader } from "~/blocks/__global/navigation-header";
import { FooterInformation } from "~/blocks/__global/footer-information";
export { loader } from "~/server/public-layout.server";
import type { loader } from "~/server/public-layout.server";

export default function PublicLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  return (
    <>
      <NavigationHeader isAuthenticated={isAuthenticated} />
      <Outlet />
      <FooterInformation />
    </>
  );
}
