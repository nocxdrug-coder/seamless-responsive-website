import { supabase } from "../lib/supabase";

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    return res.status(200).json({ 
      success: true, 
      message: "API is healthy", 
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      message: "Database connection failed", 
      error: err?.message 
    });
  }
}
