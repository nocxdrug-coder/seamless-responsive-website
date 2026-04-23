/**
 * Supabase — server-only. Uses process.env (never import.meta.env).
 *
 * - Prefer SUPABASE_SERVICE_KEY for server routes (bypasses RLS; required for most DB writes here).
 * - Falls back to SUPABASE_ANON_KEY if the service key is unset (must match your RLS policies).
 *
 * Never import this module from client components. Do not expose the service key to the browser.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getMissingServerEnv, hasServerEnv, getServerEnv } from "./env.server";

const url = (getServerEnv("SUPABASE_URL") ?? "").trim();
const serviceKey = (getServerEnv("SUPABASE_SERVICE_KEY") ?? "").trim();
const anonKey = (getServerEnv("SUPABASE_ANON_KEY") ?? "").trim();

/** Prefer service role for server-side DB access. */
const serverKey = serviceKey || anonKey;

export const supabaseUsesServiceRole = Boolean(serviceKey);

const missingUrlOrAnon = getMissingServerEnv(["SUPABASE_URL", "SUPABASE_ANON_KEY"]);
if (missingUrlOrAnon.length > 0) {
  console.error(`[supabase] Missing required env: ${missingUrlOrAnon.join(", ")}`);
}
if (!serverKey) {
  console.error("[supabase] Set SUPABASE_SERVICE_KEY (recommended) or SUPABASE_ANON_KEY on the server.");
}
if (!serviceKey && anonKey) {
  console.warn(
    "[supabase] SUPABASE_SERVICE_KEY not set; using anon key. If writes fail, add the service role key in Vercel → Settings → Environment Variables.",
  );
}

/** True when URL and at least one key are present (safe for real requests). */
export const isSupabaseServerConfigured =
  Boolean(url) && Boolean(serverKey);

const placeholderUrl = "https://placeholder.supabase.co";
const placeholderKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

/**
 * Primary server client (service key if available, otherwise anon).
 * Avoid calling before checking isSupabaseServerConfigured in API handlers when possible.
 */
export const supabase: SupabaseClient = createClient(
  url || placeholderUrl,
  serverKey || placeholderKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-client-info": "cc-shop-server/1.0" },
    },
  },
);

/**
 * Service-role client when the key exists; otherwise same as supabase.
 * Use when code paths must assume RLS bypass (still safe at runtime if only anon is configured).
 */
export const supabaseAdmin: SupabaseClient = serviceKey
  ? createClient(url || placeholderUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { "x-client-info": "cc-shop-server-admin/1.0" },
      },
    })
  : supabase;

export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  error?: string;
  usingServiceKey: boolean;
}> {
  if (!isSupabaseServerConfigured) {
    return {
      ok: false,
      error: "Supabase URL or keys missing from server environment",
      usingServiceKey: supabaseUsesServiceRole,
    };
  }
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) return { ok: false, error: error.message, usingServiceKey: supabaseUsesServiceRole };
    return { ok: true, usingServiceKey: supabaseUsesServiceRole };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      usingServiceKey: supabaseUsesServiceRole,
    };
  }
}
