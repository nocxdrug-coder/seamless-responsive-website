/**
 * In-memory sliding-window rate limiter.
 *
 * Usage:
 *   const limiter = new RateLimiter({ windowMs: 15 * 60_000, max: 10 });
 *   if (!limiter.check(ip)) throw new TooManyRequestsError();
 *
 * For production with multiple Node processes, swap the Map for Redis.
 */

export interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests allowed in the window */
  max: number;
}

interface BucketEntry {
  timestamps: number[];
}

export class RateLimiter {
  private readonly store = new Map<string, BucketEntry>();
  private readonly windowMs: number;
  private readonly max: number;

  constructor(opts: RateLimiterOptions) {
    this.windowMs = opts.windowMs;
    this.max = opts.max;
    // Periodic cleanup to prevent memory leak from abandoned keys
    setInterval(() => this.cleanup(), opts.windowMs * 2);
  }

  /**
   * Returns true if the key is within limits (request allowed).
   * Returns false if rate limit exceeded.
   */
  check(key: string): boolean {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    let bucket = this.store.get(key);

    if (!bucket) {
      bucket = { timestamps: [] };
      this.store.set(key, bucket);
    }

    // Slide the window — drop timestamps outside the window
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

    if (bucket.timestamps.length >= this.max) {
      return false; // Exceeded
    }

    bucket.timestamps.push(now);
    return true; // Allowed
  }

  /** Returns seconds until the bucket resets for a given key */
  retryAfterSeconds(key: string): number {
    const bucket = this.store.get(key);
    if (!bucket || bucket.timestamps.length === 0) return 0;
    const oldest = bucket.timestamps[0];
    return Math.ceil((oldest + this.windowMs - Date.now()) / 1000);
  }

  /** Clears all timestamps for a key (e.g., after successful login) */
  reset(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, bucket] of this.store.entries()) {
      bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
      if (bucket.timestamps.length === 0) this.store.delete(key);
    }
  }
}

// ─── Singleton limiters ────────────────────────────────────────────────────────

/** Login: 10 attempts per 15 minutes per IP */
export const loginLimiter = new RateLimiter({ windowMs: 15 * 60_000, max: 10 });

/** Register: 5 registrations per hour per IP */
export const registerLimiter = new RateLimiter({ windowMs: 60 * 60_000, max: 5 });

/** Admin login: 20 attempts per 30 minutes per IP — localhost always bypassed */
export const adminLoginLimiter = new RateLimiter({ windowMs: 30 * 60_000, max: 20 });

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Extracts the best-available client IP from a request.
 * Priority: cf-connecting-ip (Cloudflare) → x-forwarded-for[0] → x-real-ip → "unknown"
 */
export function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf && cf !== "unknown") return cf.replace(/^::ffff:/i, "").trim();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first && first !== "unknown") return first.replace(/^::ffff:/i, "").trim();
  }

  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

/** Returns true if the IP is a local/development IP that should bypass rate limits */
export function isLocalhostIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "unknown" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip === "localhost"
  );
}
