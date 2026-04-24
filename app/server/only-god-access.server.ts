
type LockedAccount = {
  id: string;
  email: string;
  failedAttempts: number;
  lockedUntil: number;
  remainingMs: number;
};

export async function loader({ request }: { request: Request }): Promise<Response> {
  try {
    const { isValidBypassToken, getLockedAccounts } = await import("~/server/login-lock.server");
    const { parseAdminSession } = await import("~/server/session.server");

    const url   = new URL(request.url);
    const token = url.searchParams.get("t") ?? "";

    // Layer 1: BYPASS_SECRET token check
    if (!isValidBypassToken(token)) {
      return Response.json({ authorized: false, token: "", adminId: null, lockedAccounts: [] });
    }

    // Layer 2: Must have a valid admin session
    const adminSession = parseAdminSession(request);
    if (!adminSession || adminSession.role !== "admin") {
      return Response.json({ authorized: false, token, adminId: null, lockedAccounts: [], needsAdminLogin: true });
    }

    let lockedAccounts: LockedAccount[] = [];
    try {
      lockedAccounts = await getLockedAccounts();
    } catch {
      /* Supabase might not have the columns yet — fail gracefully */
    }

    return Response.json({
      authorized: true,
      token,
      adminId: adminSession.userId,
      lockedAccounts,
      needsAdminLogin: false,
    });
  } catch (err) {
    console.error("[only-god-access] loader error:", err);
    return Response.json({ authorized: false, token: "", adminId: null, lockedAccounts: [] });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    const { isValidBypassToken, unlockByEmail } = await import("~/server/login-lock.server");
    const { parseAdminSession } = await import("~/server/session.server");

    const form  = await request.formData();
    const token = (form.get("token") as string) ?? "";
    const email = (form.get("email") as string) ?? "";

    // Layer 1: BYPASS_SECRET check
    if (!isValidBypassToken(token)) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Layer 2: Admin session check
    const adminSession = parseAdminSession(request);
    if (!adminSession || adminSession.role !== "admin") {
      return Response.json({ ok: false, error: "Admin session required" }, { status: 403 });
    }

    if (!email.trim()) {
      return Response.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    try {
      const result = await unlockByEmail(email);
      if (!result.found) {
        return Response.json({ ok: false, error: `No user found with email: ${email}` });
      }
      console.log(`[bypass-panel] Admin ${adminSession.userId} unlocked account: ${result.email}`);
      return Response.json({
        ok:      true,
        message: `✓ Account ${result.email} has been unlocked.${result.was_locked ? "" : " (was not locked)"}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return Response.json({ ok: false, error: msg }, { status: 500 });
    }
  } catch (err) {
    console.error("[only-god-access] action error:", err);
    return Response.json({ ok: false, error: "Service temporarily unavailable." }, { status: 503 });
  }
}
