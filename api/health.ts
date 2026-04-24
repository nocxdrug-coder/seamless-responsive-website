/** GET /api/health — system diagnostics */
import { supabase, testConnection } from "../lib/supabase";
import { getEnv, hasEnv } from "../lib/env";

export default async function handler(_req: Request): Promise<Response> {
  try {
    const conn = await testConnection();
    const tables = ["users", "products", "orders", "transactions", "deposits", "settings", "processed_callbacks"];
    const tableChecks: Record<string, boolean> = {};
    await Promise.all(tables.map(async (t) => {
      const { error } = await supabase.from(t).select("*").limit(1);
      tableChecks[t] = !error;
    }));
    const allExist = Object.values(tableChecks).every(Boolean);

    return new Response(JSON.stringify({
      status: conn.ok && allExist ? "ok" : "error",
      timestamp: new Date().toISOString(),
      env: {
        SUPABASE_URL:         getEnv("SUPABASE_URL") ?? "NOT SET",
        SUPABASE_ANON_KEY:   hasEnv("SUPABASE_ANON_KEY")    ? "set" : "NOT SET",
        SUPABASE_SERVICE_KEY: hasEnv("SUPABASE_SERVICE_KEY") ? "set" : "NOT SET",
        SESSION_SECRET:       hasEnv("SESSION_SECRET")       ? "set" : "NOT SET",
        ADMIN_SESSION_SECRET: hasEnv("ADMIN_SESSION_SECRET") ? "set" : "NOT SET",
        BYPASS_SECRET:        hasEnv("BYPASS_SECRET")        ? "set" : "NOT SET",
      },
      supabase: { connected: conn.ok, error: conn.error ?? null },
      tables: tableChecks,
    }, null, 2), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ status: "error", error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
}
