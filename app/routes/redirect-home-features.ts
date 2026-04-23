/** GET /features → home anchor #features (public marketing section). */
export function loader({ request }: { request: Request }) {
  const u = new URL(request.url);
  u.pathname = "/";
  u.hash = "features";
  return Response.redirect(u.toString(), 302);
}
