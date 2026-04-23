import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AdminLegacyRedirectRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    // Client-side 404 - redirect to home or show not found
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}
