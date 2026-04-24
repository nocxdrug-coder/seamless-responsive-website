/** Supabase client for Vercel API functions. Imports only from npm + lib/env. */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "./env";

function buildClient(): SupabaseClient {
  const url        = (getEnv("SUPABASE_URL") ?? "").trim();
  const serviceKey = (getEnv("SUPABASE_SERVICE_KEY") ?? "").trim();
  const anonKey    = (getEnv("SUPABASE_ANON_KEY") ?? "").trim();
  const key        = serviceKey || anonKey;
  const placeholder = "https://placeholder.supabase.co";
  const placeholderKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
  return createClient(url || placeholder, key || placeholderKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-client-info": "cc-shop-server/1.0" } },
  });
}

export const supabase: SupabaseClient = buildClient();

export async function testConnection() {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    return { ok: !error, error: error?.message };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
