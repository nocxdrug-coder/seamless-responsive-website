/**
 * GET /api/health — diagnostic endpoint.
 *
 * Returns Supabase connection status, env var presence,
 * and table existence. Use this to debug connectivity issues.
 *
 * NOT protected — intentionally public for debugging.
 * Remove or protect in final production build.
 */
import { supabase, testSupabaseConnection } from "~/server/supabase.server";
import { getExpectedServerEnv, getMissingServerEnv, hasServerEnv } from "~/server/env.server";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export async function loader() {
  const { getServerEnv } = await import("~/server/env.server");
  const urlSet = !!getServerEnv("SUPABASE_URL");
  const anonKeySet = !!getServerEnv("SUPABASE_ANON_KEY");
  const serviceKeySet = !!getServerEnv("SUPABASE_SERVICE_KEY");
  const expectedEnv = getExpectedServerEnv();
  const missingRequiredEnv = getMissingServerEnv(expectedEnv.required);
  const missingAuthEnv = getMissingServerEnv(expectedEnv.authWrites);

  const conn = await testSupabaseConnection();

  const tableChecks: Record<string, boolean> = {};
  const tables = ["users", "products", "orders", "transactions", "deposits", "settings", "processed_callbacks"];

  await Promise.all(
    tables.map(async (table) => {
      const { error } = await supabase.from(table).select("*").limit(1);
      tableChecks[table] = !error;
    })
  );

  const allTablesExist = Object.values(tableChecks).every(Boolean);

  return json({
    status: conn.ok && allTablesExist ? "ok" : "error",
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: urlSet ? getServerEnv("SUPABASE_URL") : "NOT SET",
      SUPABASE_ANON_KEY: anonKeySet ? "set" : "NOT SET",
      SUPABASE_SERVICE_KEY: serviceKeySet ? "set (using this)" : "NOT SET",
      SESSION_SECRET: hasServerEnv("SESSION_SECRET") ? "set" : "NOT SET",
      ADMIN_SESSION_SECRET: hasServerEnv("ADMIN_SESSION_SECRET") ? "set" : "NOT SET",
      LGPAY_APP_ID: hasServerEnv("LGPAY_APP_ID") ? "set" : "NOT SET",
      LGPAY_SECRET_KEY: hasServerEnv("LGPAY_SECRET_KEY") ? "set" : "NOT SET",
      BYPASS_SECRET: hasServerEnv("BYPASS_SECRET") ? "set" : "NOT SET",
    },
    missing_env: {
      required: missingRequiredEnv,
      auth_writes: missingAuthEnv,
    },
    supabase: {
      connected: conn.ok,
      usingServiceKey: conn.usingServiceKey,
      error: conn.error ?? null,
    },
    tables: tableChecks,
    migration_needed: !allTablesExist,
    migration_url: "https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new",
    service_key_url: "https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/settings/api",
    instructions: !serviceKeySet
      ? "SUPABASE_SERVICE_KEY missing — auth writes and admin actions will fail until it is added to Vercel."
      : allTablesExist
        ? "All tables exist and the service key is set. System operational."
        : "Some tables are missing. Run db-migrate.sql in the Supabase SQL Editor.",
  });
}
