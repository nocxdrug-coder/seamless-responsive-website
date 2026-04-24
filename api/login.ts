/** POST /api/login — authenticate user or logout (?action=logout) */
import { supabase } from "../lib/supabase";
import { createSessionCookie, destroySessionCookie } from "../lib/session";
import { hasEnv } from "../lib/env";
import bcrypt from "bcryptjs";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
}

function sanitizeEmail(v: unknown): string { return typeof v === "string" ? v.toLowerCase().trim().slice(0, 254) : ""; }
function isValidEmail(e: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default async function handler(req: Request): Promise<Response> {
  // 1. Accept only POST
  if (req.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "logout") {
      return json({ success: true, message: "Logged out" }, {
        headers: { "Set-Cookie": destroySessionCookie(req) },
      });
    }

    if (!hasEnv("SUPABASE_URL") || !hasEnv("SESSION_SECRET") || (!hasEnv("SUPABASE_SERVICE_KEY") && !hasEnv("SUPABASE_ANON_KEY"))) {
      return json({ success: false, message: "Authentication is not configured on the server." }, { status: 503 });
    }

    const body = await req.json();
    const { email: rawEmail, password } = body;

    const email = sanitizeEmail(rawEmail);

    if (!email || !isValidEmail(email)) {
      return json({ success: false, message: "Invalid email address" }, { status: 400 });
    }
    if (!password) {
      return json({ success: false, message: "Password is required" }, { status: 400 });
    }
    if (password.length > 128) {
      return json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id,email,name,role,password_hash,failed_attempts,locked_until")
      .eq("email", email)
      .maybeSingle();

    // Account lock check
    if (user?.locked_until && Date.now() < Number(user.locked_until)) {
      const remaining = Math.ceil((Number(user.locked_until) - Date.now()) / 60000);
      return json({ success: false, message: `Account locked. Try again in ${remaining}m.`, locked: true }, { status: 423 });
    }

    const valid = user ? await bcrypt.compare(password, user.password_hash ?? "") : false;

    if (!user || !valid) {
      if (user) {
        const attempts = (Number(user.failed_attempts ?? 0)) + 1;
        const lockUntil = attempts >= 5 ? Date.now() + 10 * 60 * 1000 : null;
        await supabase.from("users").update({ failed_attempts: attempts, ...(lockUntil ? { locked_until: lockUntil } : {}) }).eq("id", user.id);
        if (lockUntil) return json({ success: false, message: "Account locked for 10 minutes.", locked: true }, { status: 423 });
        const left = 5 - attempts;
        if (left <= 2) return json({ success: false, message: `Invalid credentials. ${left} attempt${left !== 1 ? "s" : ""} remaining.` }, { status: 401 });
      }
      return json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    await supabase.from("users").update({ failed_attempts: 0, locked_until: null }).eq("id", user.id);
    const cookie = createSessionCookie({ userId: user.id, role: user.role }, req);
    return json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { headers: { "Set-Cookie": cookie } });
  } catch (err) {
    console.error("Login API Error:", err);
    return json({ success: false, message: "Server error" }, { status: 500 });
  }
}
