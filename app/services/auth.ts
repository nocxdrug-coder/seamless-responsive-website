const API_BASE =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "";

export async function login(email: string, password: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // ✅ Content-Type check (VERY IMPORTANT)
    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error("Server error: invalid response");
    }

    const data = await res.json();

    // ✅ Handle API errors properly
    if (!res.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        `Login failed (${res.status})`
      );
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeout);

    // ✅ Timeout handling
    if (err.name === "AbortError") {
      throw new Error("Request timeout (server not responding)");
    }

    // ✅ Network error (server down / wrong port)
    if (err.message === "Failed to fetch") {
      throw new Error("Cannot connect to server");
    }

    throw new Error(err.message || "Something went wrong");
  }
}