import { supabase } from "../lib/supabase";
import { createSessionCookie, parseSession } from "../lib/session";
import bcrypt from "bcryptjs";

function buildWebReq(nodeReq: any): Request {
  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers || {})) {
    if (v !== undefined) headers.append(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  return new Request(nodeReq.url, { method: nodeReq.method, headers });
}

const handlers: Record<string, Record<string, (req: any, res: any) => Promise<void>>> = {
  "/api/health": {
    GET: async (req, res) => {
      try {
        const { error } = await supabase.from("users").select("id").limit(1);
        if (error) throw error;
        res.status(200).json({ success: true, message: "API is healthy", timestamp: new Date().toISOString() });
      } catch (err: any) {
        res.status(500).json({ success: false, message: "Database connection failed", error: err?.message });
      }
    }
  },
  "/api/login": {
    POST: async (req, res) => {
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
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
  },
  "/api/admin-auth": {
    POST: async (req, res) => {
      try {
        const { email, password } = req.body || {};
        if (!email || !password) {
          return res.status(400).json({ success: false, message: "Missing credentials" });
        }
        const cleanEmail = String(email).toLowerCase().trim();
        const { data: user } = await supabase
          .from("users")
          .select("id,email,name,role,password_hash")
          .eq("email", cleanEmail)
          .eq("role", "admin")
          .maybeSingle();
        const valid = user ? await bcrypt.compare(password, user.password_hash ?? "") : false;
        if (!user || !valid) {
          return res.status(401).json({ success: false, message: "Invalid admin credentials" });
        }
        const cookie = createSessionCookie({ userId: user.id, role: "admin" }, buildWebReq(req));
        res.setHeader("Set-Cookie", cookie);
        return res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
      } catch (err) {
        console.error("Admin auth error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
  },
  "/api/register": {
    POST: async (req, res) => {
      try {
        const { email, password, name } = req.body || {};
        if (!email || !password || !name) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const cleanEmail = String(email).toLowerCase().trim();
        const { data: existing } = await supabase.from("users").select("id").eq("email", cleanEmail).maybeSingle();
        if (existing) {
          return res.status(409).json({ success: false, message: "Email already registered" });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const { data: user, error } = await supabase
          .from("users")
          .insert({ email: cleanEmail, name: String(name).trim(), password_hash, role: "user" })
          .select("id,email,name,role")
          .single();
        if (error || !user) {
          return res.status(500).json({ success: false, message: "Failed to create user" });
        }
        const cookie = createSessionCookie({ userId: user.id, role: user.role }, buildWebReq(req));
        res.setHeader("Set-Cookie", cookie);
        return res.status(201).json({ success: true, user });
      } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
  },
  "/api/user": {
    GET: async (req, res) => {
      try {
        const session = await parseSession(buildWebReq(req));
        if (!session?.userId) {
          return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const { data: user } = await supabase
          .from("users")
          .select("id,email,name,role,wallet_balance")
          .eq("id", session.userId)
          .maybeSingle();
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", session.userId)
          .order("created_at", { ascending: false })
          .limit(10);
        return res.status(200).json({
          success: true,
          user: { id: user.id, email: user.email, name: user.name, role: user.role, wallet_balance: user.wallet_balance },
          transactions: transactions || []
        });
      } catch (err) {
        console.error("User fetch error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
      }
    }
  }
};

export default async function handler(req: any, res: any): Promise<void> {
  // Vercel catch-all: path segments are in req.query.path as array
  const pathSegments = req.query?.path || [];
  const subPath = Array.isArray(pathSegments) ? pathSegments.join("/") : pathSegments;
  const path = "/api/" + subPath;
  const method = (req.method || "").toUpperCase();
  
  console.log(`API HIT: ${path} ${method}`);
  
  const routeHandlers = handlers[path];
  if (!routeHandlers) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }
  
  const methodHandler = routeHandlers[method] || routeHandlers["GET"];
  if (!methodHandler) {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  
  return methodHandler(req, res);
}
