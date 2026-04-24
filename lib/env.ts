/** Shared environment variable access for Vercel API functions. */

export function getEnv(key: string): string | undefined {
  switch (key) {
    case "SUPABASE_URL":         return process.env.SUPABASE_URL;
    case "SUPABASE_ANON_KEY":   return process.env.SUPABASE_ANON_KEY;
    case "SESSION_SECRET":      return process.env.SESSION_SECRET;
    case "ADMIN_SESSION_SECRET":return process.env.ADMIN_SESSION_SECRET;
    case "LGPAY_APP_ID":        return process.env.LGPAY_APP_ID;
    case "LGPAY_SECRET_KEY":    return process.env.LGPAY_SECRET_KEY;
    case "SUPABASE_SERVICE_KEY":return process.env.SUPABASE_SERVICE_KEY;
    case "BYPASS_SECRET":       return process.env.BYPASS_SECRET;
    default:                    return process.env[key];
  }
}

export function hasEnv(key: string): boolean {
  const v = getEnv(key);
  return !!v && v.trim().length > 0;
}
