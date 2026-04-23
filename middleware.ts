/* ── Vercel Edge Middleware ──
   Blocks scrapers, enforces rate limits, validates API origins.
   Uses standard Web APIs only (no Next.js dependency).
   ────────────────────────────── */

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};

/* ── Scraper / bot signatures ── */
const BAD_UA_SEGMENTS = [
  "curl", "wget", "python-requests", "axios", "scrapy",
  "headlesschrome", "phantomjs", "selenium", "puppeteer", "playwright",
  "bot", "spider", "crawler",
];
const BAD_UA_EXACT = ["", "-", "null", "undefined", "nodejs", "node"];

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
    return new Response("Too many requests", {
      status: 429,
      headers: { "Content-Type": "text/plain", "Retry-After": "60" },
    });
  }

  /* ── Missing / fake User-Agent ── */
  const ua = req.headers.get("user-agent") ?? "";
  if (isBadUserAgent(ua)) {
    return new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain" } });
  }

  /* ── API routes: enforce same-origin Referer/Origin ── */
  if (url.pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = url.host;

    const validOrigin = origin && (origin.includes(host) || origin === "null");
    const validReferer = referer && referer.includes(host);

    if (!validOrigin && !validReferer) {
      return new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain" } });
    }
  }

  /* Continue to origin — headers added via vercel.json for all routes */
  return undefined;
}
