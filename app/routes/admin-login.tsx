import { AdminLoginForm } from "~/blocks/admin-login/admin-login-form";

export { loader } from "~/server/admin-login.server";

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
