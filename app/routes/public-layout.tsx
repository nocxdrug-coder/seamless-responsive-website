import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { NavigationHeader } from "~/blocks/__global/navigation-header";
import { FooterInformation } from "~/blocks/__global/footer-information";

export default function PublicLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/user", { credentials: "include" })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <>
      <NavigationHeader isAuthenticated={isAuthenticated} />
      <Outlet />
      <FooterInformation />
    </>
  );
}
