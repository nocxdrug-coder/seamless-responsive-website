function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => body += chunk.toString());
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any): Promise<void> {
  console.log("Method:", req.method);
  console.log("Content-Type:", req.headers?.["content-type"]);
  
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const body = await parseBody(req);
    console.log("Parsed body:", JSON.stringify(body));
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: `Missing fields. Received: ${JSON.stringify(body)}` });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Login endpoint working",
      received: { email: String(email).toLowerCase().trim() }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
