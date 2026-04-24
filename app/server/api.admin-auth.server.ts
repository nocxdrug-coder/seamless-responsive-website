export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Only POST allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, message: "Missing credentials" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TEMP admin check
    if (email === "admin@test.com" && password === "admin123") {
      return new Response(JSON.stringify({
        success: true,
        admin: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: "Invalid admin credentials"
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}