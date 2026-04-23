import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminLoginForm } from "~/blocks/admin-login/admin-login-form";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  // Client-side admin auth check: redirect if already logged in as admin
  useEffect(() => {
    fetch("/api/admin-auth", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          navigate("/x7k9-secure-panel-god", { replace: true });
        }
      })
      .catch(() => {
        // Ignore errors, stay on login page
      });
  }, [navigate]);

  return <AdminLoginForm />;
}
