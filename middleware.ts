/* ── Vercel Edge Middleware ──
   Blocks scrapers, enforces rate limits, validates API origins.
   Uses standard Web APIs only (no Next.js dependency).
   ────────────────────────────── */

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)" ],
};

/* ── Scraper / bot signatures ── */
const BAD_UA_SEGMENTS = [
  "curl", "wget", "python-requests", "scrapy",
  "headlesschrome", "phantomjs", "selenium", "puppeteer", "playwright",
  "bot", "spider", "crawler",
];
const BAD_UA_EXACT = ["", "-", "null", "undefined", "nodejs", "node"];

/* ─────────────────────────────────────────────────────────────────────────────
   Public API routes — accessible without auth headers.
   These must never require Origin/Referer validation so the browser can fetch
   them freely on page load, and external services (LG-Pay callbacks, uptime
   monitors) can reach them.
   ───────────────────────────────────────────────────────────────────────────── */
const PUBLIC_API_PATHS = [
  "/api/products",
  "/api/health",
  "/api/deposit/callback", // LG-Pay sends POST without a browser Referer
];

/* ── In-memory rate limiter (per-IP, 60 req / 60 s) ── */
const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

function isBadUserAgent(ua: string): boolean {
  const lower = ua.toLowerCase().trim();
  if (BAD_UA_EXACT.includes(lower)) return true;
  return BAD_UA_SEGMENTS.some((seg) => lower.includes(seg));
}

function rateLimitExceeded(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export default function middleware(req: Request): Response | undefined {
  const url = new URL(req.url);

  /* ── Rate limiting ── */
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimitExceeded(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" },
    });
  }

  /* ── Missing / fake User-Agent (skip for Vercel-internal requests) ── */
  const ua = req.headers.get("user-agent") ?? "";
  // Allow empty UA from Vercel's own health checks / internal routing
  const isVercelInternal = req.headers.get("x-vercel-id") !== null;
  if (!isVercelInternal && isBadUserAgent(ua)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  /* ── API routes: enforce same-origin for protected endpoints only ── */
  if (url.pathname.startsWith("/api/")) {
    // Skip origin check for public endpoints
    const isPublic = PUBLIC_API_PATHS.some((p) => url.pathname.startsWith(p));
    if (!isPublic) {
      const origin  = req.headers.get("origin");
      const referer = req.headers.get("referer");
      const host    = url.host;

      // Pass if Origin or Referer matches the deployment host
      const validOrigin  = origin  && (origin.includes(host)  || origin === "null");
      const validReferer = referer && referer.includes(host);

      // Also pass if the request comes from Vercel's internal routing
      if (!validOrigin && !validReferer && !isVercelInternal) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  /* Continue to origin */
  return undefined;
}
