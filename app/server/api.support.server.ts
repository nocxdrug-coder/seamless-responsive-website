// GET /api/support — fetch user's tickets
// POST /api/support — create a ticket

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function loader({ request }: { request: Request }) {
  try {
    const { parseSession } = await import("~/server/session.server");
    const { supabase } = await import("~/server/supabase.server");

    const session = parseSession(request);
    if (!session) return json({ error: "Unauthorized" }, { status: 401 });

    console.log(`[api/support] Loading tickets for userId=${session.userId}`);

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        console.warn("[api/support] Table 'support_tickets' not found. Run fix-support.sql in Supabase.");
        return json({ tickets: [] });
      }
      console.error("[api/support] Fetch error:", error);
      return json({ error: error.message }, { status: 500 });
    }

    return json({ tickets: data ?? [] });
  } catch (err) {
    console.error("[api/support] loader error:", err);
    return json({ tickets: [] });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    const { parseSession } = await import("~/server/session.server");
    const { supabase } = await import("~/server/supabase.server");

    const session = parseSession(request);
    if (!session) return json({ error: "Unauthorized" }, { status: 401 });

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    console.log(`[api/support] POST from userId=${session.userId}`);

    const formData = await request.formData();

    const issueType = formData.get("issueType")?.toString().trim() || "General";
    const subject   = formData.get("subject")?.toString().trim() ?? "";
    const message   = formData.get("message")?.toString().trim() ?? "";
    const fileEntry = formData.get("screenshot");

    console.log(`[api/support] Payload: issueType="${issueType}" subject="${subject}" message length=${message.length}`);

    if (!subject || !message) {
      return json({ error: "Subject and message are required." }, { status: 400 });
    }

    // ── Step 1: Optional screenshot upload ────────────────────────────────────
    let finalScreenshotUrl: string | null = null;

    const hasFile =
      fileEntry !== null &&
      typeof fileEntry === "object" &&
      "size" in fileEntry &&
      (fileEntry as File).size > 0;

    if (hasFile) {
      const file = fileEntry as File;
      console.log(`[api/support] Screenshot detected: name="${file.name}" size=${file.size} bytes`);
      try {
        const ext = file.name.split(".").pop() || "png";
        const fileName = `${session.userId}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("support-screenshots")
          .upload(fileName, file, { upsert: true });

        if (uploadErr) {
          console.error("[api/support] Screenshot upload failed (non-fatal):", uploadErr.message);
        } else {
          const { data: urlData } = supabase.storage
            .from("support-screenshots")
            .getPublicUrl(fileName);
          finalScreenshotUrl = urlData.publicUrl;
          console.log(`[api/support] Screenshot uploaded OK → ${finalScreenshotUrl}`);
        }
      } catch (e) {
        console.error("[api/support] Screenshot upload threw exception (non-fatal):", e);
      }
    } else {
      console.log("[api/support] No screenshot provided. Skipping upload.");
    }

    // ── Step 2: Insert ticket ──────────────────────────────────────────────────
    const insertPayload = {
      user_id:        session.userId,
      issue_type:     issueType,
      subject,
      message,
      screenshot_url: finalScreenshotUrl,
      status:         "open",
    };

    console.log("[api/support] Inserting ticket payload:", insertPayload);

    const { data, error: insertErr } = await supabase
      .from("support_tickets")
      .insert([insertPayload])
      .select()
      .single();

    if (insertErr) {
      console.error("[api/support] INSERT FAILED:", insertErr);
      return json(
        { error: `Failed to create ticket: ${insertErr.message} (code: ${insertErr.code})` },
        { status: 500 }
      );
    }

    console.log(`[api/support] Ticket created successfully: id=${(data as any)?.id}`);
    return json({ success: true, ticket: data });
  } catch (err) {
    console.error("[api/support] action error:", err);
    return json({ error: "Service temporarily unavailable." }, { status: 503 });
  }
}
