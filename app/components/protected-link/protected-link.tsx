import type { ReactNode } from "react";
import { useAuth } from "~/hooks/use-auth";
import { useNavigate } from "react-router";

interface Props {
  to: string;
  className?: string;
  children: ReactNode;
}

/**
 * A drop-in replacement for <Link> that requires authentication.
 * Unauthenticated users are redirected to /login with the intended
 * destination stored in location state for post-login redirect.
 */
export function ProtectedLink({ to, className, children }: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: to } });
    } else {
      navigate(to);
    }
  };

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
