const API_BASE =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "";

export async function login(email: string, password: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned HTML instead of JSON");
    }

    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }

    return data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout (server not responding)");
    }
    throw new Error(err.message || "Network error");
  }
}
