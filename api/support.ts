/** GET  /api/support — fetch user's tickets
 *  POST /api/support — create a ticket */
import { supabase } from "../lib/supabase";
import { parseSession } from "../lib/session";

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
}

export default async function handler(req: Request): Promise<Response> {
  const session = parseSession(req);
  if (!session) return json({ error: "Unauthorized" }, { status: 401 });

  if (req.method === "GET") {
    const { data, error } = await supabase.from("support_tickets").select("*").eq("user_id", session.userId).order("created_at", { ascending: false });
    if (error?.code === "42P01") return json({ tickets: [] });
    if (error) return json({ error: error.message }, { status: 500 });
    return json({ tickets: data ?? [] });
  }

  if (req.method === "POST") {
    const formData = await req.formData();
    const subject   = formData.get("subject")?.toString().trim() ?? "";
    const message   = formData.get("message")?.toString().trim() ?? "";
    const issueType = formData.get("issueType")?.toString().trim() || "General";
    const file      = formData.get("screenshot");

    if (!subject || !message) return json({ error: "Subject and message are required." }, { status: 400 });

    let screenshotUrl: string | null = null;
    if (file && typeof file === "object" && "size" in file && (file as File).size > 0) {
      const f = file as File;
      const ext = f.name.split(".").pop() || "png";
      const { error: upErr } = await supabase.storage.from("support-screenshots").upload(`${session.userId}-${Date.now()}.${ext}`, f, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("support-screenshots").getPublicUrl(`${session.userId}-${Date.now()}.${ext}`);
        screenshotUrl = urlData.publicUrl;
      }
    }

    const { data, error: insertErr } = await supabase.from("support_tickets")
      .insert([{ user_id: session.userId, issue_type: issueType, subject, message, screenshot_url: screenshotUrl, status: "open" }])
      .select().single();

    if (insertErr) return json({ error: insertErr.message }, { status: 500 });
    return json({ success: true, ticket: data });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
