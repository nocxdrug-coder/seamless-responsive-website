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
    
    // Mock response - database connection needs fixing
    return res.status(200).json({ 
      success: true, 
      message: "Login endpoint working (DB connection pending)",
      received: { email: String(email).toLowerCase().trim() }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
