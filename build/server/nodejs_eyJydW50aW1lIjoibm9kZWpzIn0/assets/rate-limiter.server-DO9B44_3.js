class RateLimiter {
  store = /* @__PURE__ */ new Map();
  windowMs;
  max;
  constructor(opts) {
    this.windowMs = opts.windowMs;
    this.max = opts.max;
    setInterval(() => this.cleanup(), opts.windowMs * 2);
  }
  /**
   * Returns true if the key is within limits (request allowed).
   * Returns false if rate limit exceeded.
   */
  check(key) {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    let bucket = this.store.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.store.set(key, bucket);
    }
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length >= this.max) {
      return false;
    }
    bucket.timestamps.push(now);
    return true;
  }
  /** Returns seconds until the bucket resets for a given key */
  retryAfterSeconds(key) {
    const bucket = this.store.get(key);
    if (!bucket || bucket.timestamps.length === 0) return 0;
    const oldest = bucket.timestamps[0];
    return Math.ceil((oldest + this.windowMs - Date.now()) / 1e3);
  }
  /** Clears all timestamps for a key (e.g., after successful login) */
  reset(key) {
    this.store.delete(key);
  }
  cleanup() {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, bucket] of this.store.entries()) {
      bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
      if (bucket.timestamps.length === 0) this.store.delete(key);
    }
  }
}
const loginLimiter = new RateLimiter({ windowMs: 15 * 6e4, max: 10 });
const registerLimiter = new RateLimiter({ windowMs: 60 * 6e4, max: 5 });
new RateLimiter({ windowMs: 30 * 6e4, max: 20 });
function getClientIp(request) {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf && cf !== "unknown") return cf.replace(/^::ffff:/i, "").trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first && first !== "unknown") return first.replace(/^::ffff:/i, "").trim();
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}
export {
  RateLimiter,
  getClientIp,
  loginLimiter,
  registerLimiter
};
