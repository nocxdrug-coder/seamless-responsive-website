import { supabase } from "../lib/supabase";
import { createSessionCookie } from "../lib/session";
import bcrypt from "bcryptjs";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "Only POST allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing email or password" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: user } = await supabase
      .from("users")
      .select("id,email,name,role,password_hash")
      .eq("email", email)
      .maybeSingle();

    const valid = user ? await bcrypt.compare(password, user.password_hash ?? "") : false;

    if (!user || !valid) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const cookie = createSessionCookie({ userId: user.id, role: user.role }, req);

    return new Response(
      JSON.stringify({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }),
      { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": cookie } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
