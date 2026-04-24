export default function handler(req: any, res: any): void {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  
  return res.status(200).json({ success: true, message: "POST works" });
}
