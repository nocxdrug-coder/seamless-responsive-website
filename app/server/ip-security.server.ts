/**
 * IP Security â€” server-side module.
 *
 * Provides:
 *   getClientIp()       â€” reliable IP extraction (Cloudflare â†’ proxy â†’ socket)
 *   isIpBanned()        â€” fast DB lookup, returns true if request must be blocked
 *   logIpActivity()     â€” async fire-and-forget write to ip_logs (no UI delay)
 *   banIp()             â€” upsert to banned_ips
 *   unbanIp()           â€” delete from banned_ips
 *   getBannedIps()      â€” full list for admin UI
 *   getRecentIpLogs()   â€” last N log entries for admin activity feed
 *   getUserIpHistory()  â€” last distinct IPs for a given userId
 *
 * IMPORTANT: Server-only. Never import from client components.
 */

import { UAParser } from "ua-parser-js";
import { supabase } from "./supabase.server";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface IpLog {
  id:         string;
  userId:     string | null;
  ipAddress:  string;
  userAgent:  string;
  device:     string;   // "Mobile" | "Desktop" | "Tablet"
  os:         string;   // "Windows" | "Android" | "iOS" | "macOS" | "Linux" | "Other"
  browser:    string;   // "Chrome" | "Firefox" | "Safari" | "Edge" | "Other"
  route:      string;
  action:     string;
  status:     string;
  createdAt:  number;
  createdAtDisplay: string; // DD/MM/YYYY HH:mm:ss
}

export interface BannedIp {
  id:          string;
  ipAddress:   string;
  reason:      string;
  bannedBy:    string;
  isPermanent: boolean;
  expiresAt:   number | null;
  createdAt:   number;
}

export interface LogActivityOpts {
  userId?:   string | null;
  userAgent?: string;
  route?:    string;
  action:    string;     // "login" | "register" | "purchase" | "api" | "error"
  status:    string;     // "success" | "failed" | "blocked"
}

export interface BanIpOpts {
  isPermanent?: boolean;
  expiresAt?:  number | null;  // unix ms â€” set when isPermanent=false
}

// â”€â”€â”€ IP Extraction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Extracts the most reliable client IP.
 * Priority: x-forwarded-for â†’ x-real-ip â†’ cf-connecting-ip â†’ 127.0.0.1
 * Never throws.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const forwardedIps = xForwardedFor
    .split(",")
    .map((raw) => normalizeIp(raw))
    .filter((ip): ip is string => Boolean(ip));

  const xRealIp = normalizeIp(request.headers.get("x-real-ip"));
  const cloudflareIp = normalizeIp(request.headers.get("cf-connecting-ip"));

  const candidates = [
    ...forwardedIps,
    ...(xRealIp ? [xRealIp] : []),
    ...(cloudflareIp ? [cloudflareIp] : []),
  ];

  if (candidates.length === 0) return "127.0.0.1";
  return candidates.find((ip) => !isLocalIp(ip)) ?? candidates[0];
}

function normalizeIp(input: string | null | undefined): string | null {
  if (!input) return null;

  let ip = input.trim();
  if (!ip || /^unknown$/i.test(ip)) return null;

  if (ip.toLowerCase().startsWith("for=")) {
    ip = ip.slice(4).trim().replace(/^"+|"+$/g, "");
  }

  if (ip.startsWith("[") && ip.includes("]")) {
    ip = ip.slice(1, ip.indexOf("]"));
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.split(":")[0];
  }

  ip = ip.replace(/^::ffff:/i, "").replace(/%[0-9a-z]+$/i, "").trim();

  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1" || ip.toLowerCase() === "localhost") {
    return "127.0.0.1";
  }

  return ip || null;
}

function isLocalIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

/**
 * Returns a human-readable label for the IP, flagging localhost for testing.
 */
export function displayIp(ip: string): string {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return "127.0.0.1 (Local Device)";
  }
  return ip;
}

// â”€â”€â”€ User-Agent Parsing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ParsedUserAgent {
  device:  string;
  os:      string;
  browser: string;
}

/**
 * UA parser using ua-parser-js with Client Hints fallback.
 */
export function parseUserAgent(ua: string, request?: Request): ParsedUserAgent {
  const parser = new UAParser(ua || undefined);
  const result = parser.getResult();

  const secChUa = (request?.headers.get("sec-ch-ua") ?? "").toLowerCase();
  const secChPlatform = (request?.headers.get("sec-ch-ua-platform") ?? "").replace(/"/g, "").toLowerCase();
  const secChMobile = request?.headers.get("sec-ch-ua-mobile") ?? "";

  let device = "Desktop";
  const deviceType = (result.device.type ?? "").toLowerCase();
  if (deviceType === "tablet") {
    device = "Tablet";
  } else if (deviceType === "mobile" || secChMobile.includes("?1")) {
    device = "Mobile";
  }

  let os = "Other";
  const osName = `${result.os.name ?? ""} ${secChPlatform}`.toLowerCase();
  if (osName.includes("windows")) os = "Windows";
  else if (osName.includes("android")) os = "Android";
  else if (osName.includes("ios") || osName.includes("iphone") || osName.includes("ipad")) os = "iOS";
  else if (osName.includes("mac")) os = "macOS";
  else if (osName.includes("linux")) os = "Linux";
  else if (osName.includes("chrome")) os = "ChromeOS";

  let browser = "Other";
  const browserName = `${result.browser.name ?? ""} ${secChUa}`.toLowerCase();
  if (browserName.includes("edge") || browserName.includes("edg/") || browserName.includes("microsoft edge")) browser = "Edge";
  else if (browserName.includes("opera") || browserName.includes("opr/")) browser = "Opera";
  else if (browserName.includes("samsung")) browser = "Samsung";
  else if (browserName.includes("firefox")) browser = "Firefox";
  else if (browserName.includes("chrome") || browserName.includes("chromium")) browser = "Chrome";
  else if (browserName.includes("safari")) browser = "Safari";
  else if (browserName.includes("msie") || browserName.includes("trident")) browser = "IE";

  return { device, os, browser };
}

function normalizeEpochMs(value: unknown): number {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    // Handle legacy second-based timestamps.
    return n < 100_000_000_000 ? Math.trunc(n * 1000) : Math.trunc(n);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return 0;
}

/** Format unix-ms as DD/MM/YYYY HH:mm:ss */
function fmtTimestamp(value: unknown): string {
  const ms = normalizeEpochMs(value);
  if (!ms) return "â€”";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
  ].join(" ");
}

function needsIsoTimestampRetry(message: string | undefined): boolean {
  if (!message) return false;
  return /date\/time field value out of range|invalid input syntax for type timestamp/i.test(message);
}

// â”€â”€â”€ Ban Check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns true if the IP is actively banned.
 * Permanent bans â†’ always blocked.
 * Temporary bans â†’ blocked if expires_at > now.
 * Never throws â€” if Supabase is unreachable, returns false (fail-open is safer
 * than breaking the site for all users).
 */
export async function isIpBanned(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown") return false;
  try {
    const now = Date.now();
    const { data, error } = await supabase
      .from("banned_ips")
      .select("id, is_permanent, expires_at")
      .eq("ip_address", ip)
      .maybeSingle();

    if (error || !data) return false;

    if (data.is_permanent) return true;
    if (data.expires_at && Number(data.expires_at) > now) return true;

    // Expired temporary ban â€” clean it up asynchronously
    void supabase.from("banned_ips").delete().eq("ip_address", ip);
    return false;
  } catch {
    return false;
  }
}

// â”€â”€â”€ Activity Logging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Fire-and-forget: writes one row to ip_logs.
 * Never awaited by callers â€” has zero impact on response latency.
 * Captures IP, device type, OS, browser, and human-readable timestamp.
 */
export function logIpActivity(
  request: Request,
  opts: LogActivityOpts
): void {
  const ip        = getClientIp(request);
  const userAgent =
    request.headers.get("user-agent") ??
    opts.userAgent ??
    request.headers.get("sec-ch-ua") ??
    "";
  const route     = opts.route ?? new URL(request.url).pathname;
  const now       = Date.now();
  const parsed    = parseUserAgent(userAgent, request);

  console.log(`IP: ${ip}`);
  console.log(`USER: ${opts.userId ?? "guest"}`);
  console.log(`DEVICE: ${parsed.device} / OS: ${parsed.os} / Browser: ${parsed.browser}`);
  console.log(`TIME: ${fmtTimestamp(now)}`);
  console.log(`[ip-security] action=${opts.action} status=${opts.status} route=${route}`);

  const payload = {
    user_id:    opts.userId ?? null,
    ip_address: ip,
    user_agent: userAgent.slice(0, 512),
    device:     parsed.device,
    os:         parsed.os,
    browser:    parsed.browser,
    route:      route.slice(0, 200),
    action:     opts.action,
    status:     opts.status,
    created_at: now as number | string,
  };

  void (async () => {
    const first = await supabase.from("ip_logs").insert(payload);
    if (!first.error) return;

    if (needsIsoTimestampRetry(first.error.message)) {
      const retry = await supabase.from("ip_logs").insert({
        ...payload,
        created_at: new Date(now).toISOString(),
      });
      if (!retry.error) return;
      console.error(`[ip-security] âš  ip_logs insert FAILED after retry for action=${opts.action} ip=${ip}:`, retry.error.message, retry.error.code);
      return;
    }

    console.error(`[ip-security] âš  ip_logs insert FAILED for action=${opts.action} ip=${ip}:`, first.error.message, first.error.code);
  })();
}

// â”€â”€â”€ Ban Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function banIp(
  ip:       string,
  reason:   string,
  bannedBy: string,
  opts:     BanIpOpts = {}
): Promise<void> {
  const isPermanent = opts.isPermanent !== false;
  const expiresAt   = isPermanent ? null : (opts.expiresAt ?? null);

  const now = Date.now();
  const payload = {
    ip_address:   ip.trim(),
    reason:       reason.slice(0, 500),
    banned_by:    bannedBy,
    is_permanent: isPermanent,
    expires_at:   expiresAt,
    created_at:   now as number | string,
  };

  const first = await supabase.from("banned_ips").upsert(payload, { onConflict: "ip_address" });
  if (!first.error) {
    console.log(`[ip-security] BANNED ${ip} by ${bannedBy}: ${reason}`);
    return;
  }

  if (needsIsoTimestampRetry(first.error.message)) {
    const retry = await supabase.from("banned_ips").upsert(
      { ...payload, created_at: new Date(now).toISOString() },
      { onConflict: "ip_address" }
    );
    if (!retry.error) {
      console.log(`[ip-security] BANNED ${ip} by ${bannedBy}: ${reason}`);
      return;
    }
    throw new Error("Failed to ban IP: " + retry.error.message);
  }

  throw new Error("Failed to ban IP: " + first.error.message);
}

export async function unbanIp(ip: string): Promise<void> {
  const { error } = await supabase
    .from("banned_ips")
    .delete()
    .eq("ip_address", ip.trim());
  if (error) throw new Error("Failed to unban IP: " + error.message);
  console.log(`[ip-security] UNBANNED ${ip}`);
}

// â”€â”€â”€ Admin Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToLog(row: any): IpLog {
  const ms = normalizeEpochMs(row.created_at);
  const ip = String(row.ip_address ?? "");
  return {
    id:               row.id,
    userId:           row.user_id ?? null,
    ipAddress:        displayIp(ip),
    userAgent:        row.user_agent ?? "",
    device:           row.device   ?? "Unknown",
    os:               row.os       ?? "Unknown",
    browser:          row.browser  ?? "Unknown",
    route:            row.route    ?? "",
    action:           row.action   ?? "",
    status:           row.status   ?? "",
    createdAt:        ms,
    createdAtDisplay: fmtTimestamp(ms),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBan(row: any): BannedIp {
  return {
    id:          row.id,
    ipAddress:   row.ip_address,
    reason:      row.reason ?? "",
    bannedBy:    row.banned_by ?? "admin",
    isPermanent: Boolean(row.is_permanent),
    expiresAt:   row.expires_at ? normalizeEpochMs(row.expires_at) : null,
    createdAt:   normalizeEpochMs(row.created_at),
  };
}

/** Recent activity feed for the admin Security tab. */
export async function getRecentIpLogs(limit = 100): Promise<IpLog[]> {
  const { data, error } = await supabase
    .from("ip_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("[ip-security] getRecentIpLogs:", error.message); return []; }
  return (data ?? []).map(rowToLog);
}

/** All currently active bans. */
export async function getBannedIps(): Promise<BannedIp[]> {
  const { data, error } = await supabase
    .from("banned_ips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[ip-security] getBannedIps:", error.message); return []; }
  return (data ?? []).map(rowToBan);
}

/** Last 10 distinct IPs used by a specific user. */
export async function getUserIpHistory(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("ip_logs")
    .select("ip_address, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  // Deduplicate while preserving recency order
  const seen  = new Set<string>();
  const result: string[] = [];
  for (const row of data) {
    if (!seen.has(row.ip_address)) {
      seen.add(row.ip_address);
      result.push(row.ip_address);
      if (result.length >= 10) break;
    }
  }
  return result;
}

/** Standard 403 response for banned IPs â€” reveals no internal detail. */
export function bannedResponse(): Response {
  return new Response(
    JSON.stringify({
      error:   "Access restricted.",
      message: "Your access has been restricted. Contact support if you believe this is an error.",
    }),
    {
      status:  403,
      headers: { "Content-Type": "application/json" },
    }
  );
}

