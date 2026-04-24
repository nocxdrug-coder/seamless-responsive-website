import { supabase } from "../lib/supabase";

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    
    // Simple test without bcrypt - just check if user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("id,email,name,role")
      .eq("email", cleanEmail)
      .maybeSingle();
    
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "User found (bcrypt disabled for testing)",
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
