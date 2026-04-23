import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/use-auth";

/**
 * Returns a navigate function that enforces authentication.
 * If the user is not authenticated, redirects to /login.
 * Otherwise navigates to the intended destination.
 */
export function useProtectedNavigate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (to: string) => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: to } });
    } else {
      navigate(to);
    }
  };
}
