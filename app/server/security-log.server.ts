/**
 * Security event logger.
 *
 * Logs suspicious activity and failed authentication attempts.
 * In production, pipe these to a real logging service (Datadog, Sentry, etc.).
 *
 * All logs are structured JSON for easy parsing.
 */

export type SecurityEventType =
  | "LOGIN_FAILED"
  | "LOGIN_SUCCESS"
  | "LOGIN_BLOCKED"
  | "ACCOUNT_LOCKED"
  | "RATE_LIMITED"
  | "ADMIN_LOGIN_FAILED"
  | "ADMIN_LOGIN_SUCCESS"
  | "ADMIN_UNAUTHORIZED"
  | "ADMIN_ACTION"
  | "REGISTER_FAILED"
  | "INVALID_SESSION"
  | "SUSPICIOUS_INPUT";

interface SecurityEvent {
  timestamp: string;
  event: SecurityEventType;
  ip: string;
  email?: string;
  userId?: string;
  detail?: string;
}

// In-memory ring buffer — keeps last 500 events
const MAX_EVENTS = 500;
const eventLog: SecurityEvent[] = [];

function emit(event: SecurityEvent): void {
  if (eventLog.length >= MAX_EVENTS) eventLog.shift();
  eventLog.push(event);
  // Always write to stderr so it shows in the terminal even in prod
  console.error(`[SECURITY] ${JSON.stringify(event)}`);
}

export function logSecurityEvent(
  event: SecurityEventType,
  ip: string,
  extra?: { email?: string; userId?: string; detail?: string }
): void {
  emit({
    timestamp: new Date().toISOString(),
    event,
    ip,
    ...extra,
  });
}

/** Returns recent security events (admin-only endpoint use) */
export function getRecentEvents(limit = 50): SecurityEvent[] {
  return [...eventLog].reverse().slice(0, limit);
}

// ─── Input Sanitization ────────────────────────────────────────────────────────

const UNSAFE_CHARS = /[<>"'`\\;]/g;

/**
 * Strips characters that could be used for XSS or injection attacks.
 * Returns a clean string safe for DB insertion (when using parameterized queries)
 * and safe for rendering.
 */
export function sanitizeString(input: unknown, maxLength = 320): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(UNSAFE_CHARS, "").substring(0, maxLength);
}

export function sanitizeEmail(input: unknown): string {
  const raw = sanitizeString(input, 320);
  // Basic email structure validation — detailed check is in the route
  return raw.toLowerCase();
}

/**
 * Validates an email address with a strict pattern.
 */
export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Generic safe response — never exposes internal error details to clients.
 */
export function safeErrorMessage(err: unknown): string {
  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred. Please try again.";
}
