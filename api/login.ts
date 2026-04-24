import { supabase } from "../lib/supabase";
import { createSessionCookie } from "../lib/session";
import bcrypt from "bcryptjs";

function buildWebReq(nodeReq: any): Request {
  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers || {})) {
    if (v !== undefined) headers.append(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  return new Request(nodeReq.url, { method: nodeReq.method, headers });
}

export default async function handler(req: any, res: any): Promise<void> {
  console.log("API HIT: /api/login", req.method);

  const method = (req.method || "").toUpperCase();
  if (method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const { data: user } = await supabase
      .from("users")
      .select("id,email,name,role,password_hash")
      .eq("email", cleanEmail)
      .maybeSingle();

    const valid = user ? await bcrypt.compare(password, user.password_hash ?? "") : false;
    if (!user || !valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const cookie = createSessionCookie({ userId: user.id, role: user.role }, buildWebReq(req));
    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
