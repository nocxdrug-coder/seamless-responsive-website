/** GET /products → home anchor #cards (featured products). */
export function loader({ request }: { request: Request }) {
  const u = new URL(request.url);
  u.pathname = "/";
  u.hash = "cards";
  return Response.redirect(u.toString(), 302);
}
