const REQUIRED_SERVER_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SESSION_SECRET",
  "ADMIN_SESSION_SECRET",
  "LGPAY_APP_ID",
  "LGPAY_SECRET_KEY",
] as const;

const AUTH_WRITE_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "SESSION_SECRET",
  "ADMIN_SESSION_SECRET",
] as const;

export type ServerEnvKey = (typeof REQUIRED_SERVER_ENV_KEYS)[number] | "SUPABASE_SERVICE_KEY" | "BYPASS_SECRET";

export function getServerEnv(key: ServerEnvKey): string | undefined {
  // Use dot notation to avoid Vite `process.env` dynamic access bundling issues
  switch (key) {
    case "SUPABASE_URL": return process.env.SUPABASE_URL;
    case "SUPABASE_ANON_KEY": return process.env.SUPABASE_ANON_KEY;
    case "SESSION_SECRET": return process.env.SESSION_SECRET;
    case "ADMIN_SESSION_SECRET": return process.env.ADMIN_SESSION_SECRET;
    case "LGPAY_APP_ID": return process.env.LGPAY_APP_ID;
    case "LGPAY_SECRET_KEY": return process.env.LGPAY_SECRET_KEY;
    case "SUPABASE_SERVICE_KEY": return process.env.SUPABASE_SERVICE_KEY;
    case "BYPASS_SECRET": return process.env.BYPASS_SECRET;
    default: return process.env[key];
  }
}

function isMissing(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function hasServerEnv(key: ServerEnvKey): boolean {
  return !isMissing(getServerEnv(key));
}

export function getMissingServerEnv(keys: readonly ServerEnvKey[]): ServerEnvKey[] {
  return keys.filter((key) => !hasServerEnv(key));
}

export function logMissingServerEnv(context: string, keys: readonly ServerEnvKey[]): ServerEnvKey[] {
  const missing = getMissingServerEnv(keys);
  
  // Debug log for existence of all requested keys
  const debugInfo = keys.map(k => `${k}: ${hasServerEnv(k) ? "Set" : "Missing"}`).join(", ");
  console.log(`[env] ${context} check -> ${debugInfo}`);

  if (missing.length > 0) {
    console.error(`[env] ${context} missing required env vars: ${missing.join(", ")}`);
  }
  return missing;
}

export function getExpectedServerEnv() {
  return {
    required: [...REQUIRED_SERVER_ENV_KEYS],
    authWrites: [...AUTH_WRITE_ENV_KEYS],
    optional: ["SUPABASE_SERVICE_KEY", "BYPASS_SECRET"] satisfies ServerEnvKey[],
  };
}

/**
 * Login/register/session APIs: URL + SESSION_SECRET + at least one Supabase key
 * (service role preferred on the server; anon is accepted if RLS allows your queries).
 */
export function logMissingUserAuthEnv(context: string): ServerEnvKey[] {
  const missing = [...getMissingServerEnv(["SUPABASE_URL", "SESSION_SECRET"])];
  const hasDbKey =
    hasServerEnv("SUPABASE_SERVICE_KEY") || hasServerEnv("SUPABASE_ANON_KEY");
  console.log(
    `[env] ${context} user-auth -> SUPABASE_URL: ${hasServerEnv("SUPABASE_URL") ? "set" : "missing"}, ` +
      `SESSION_SECRET: ${hasServerEnv("SESSION_SECRET") ? "set" : "missing"}, ` +
      `SERVICE_KEY: ${hasServerEnv("SUPABASE_SERVICE_KEY") ? "set" : "missing"}, ` +
      `ANON_KEY: ${hasServerEnv("SUPABASE_ANON_KEY") ? "set" : "missing"}`,
  );
  if (!hasDbKey) {
    console.error(
      `[env] ${context} needs SUPABASE_SERVICE_KEY (recommended) or SUPABASE_ANON_KEY in server/Vercel env (not VITE_*)`,
    );
    missing.push("SUPABASE_SERVICE_KEY");
  }
  return missing;
}

/** Admin auth: URL + ADMIN_SESSION_SECRET + at least one Supabase server key. */
export function logMissingAdminAuthEnv(context: string): ServerEnvKey[] {
  const missing = [...getMissingServerEnv(["SUPABASE_URL", "ADMIN_SESSION_SECRET"])];
  const hasDbKey =
    hasServerEnv("SUPABASE_SERVICE_KEY") || hasServerEnv("SUPABASE_ANON_KEY");
  console.log(
    `[env] ${context} admin-auth -> SUPABASE_URL: ${hasServerEnv("SUPABASE_URL") ? "set" : "missing"}, ` +
      `ADMIN_SESSION_SECRET: ${hasServerEnv("ADMIN_SESSION_SECRET") ? "set" : "missing"}, ` +
      `SERVICE_KEY: ${hasServerEnv("SUPABASE_SERVICE_KEY") ? "set" : "missing"}, ` +
      `ANON_KEY: ${hasServerEnv("SUPABASE_ANON_KEY") ? "set" : "missing"}`,
  );
  if (!hasDbKey) {
    console.error(
      `[env] ${context} needs SUPABASE_SERVICE_KEY (recommended) or SUPABASE_ANON_KEY in server env`,
    );
    missing.push("SUPABASE_SERVICE_KEY");
  }
  return missing;
}
