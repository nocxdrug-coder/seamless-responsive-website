import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function RedirectHomeProductsRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/#cards", { replace: true });
  }, [navigate]);

  return null;
}
