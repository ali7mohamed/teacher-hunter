import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin client using the SERVICE ROLE key. Bypasses RLS.
 * SERVER-ONLY. Never import this from a Client Component or expose it to
 * the browser. Use only for trusted server-side operations (e.g. background
 * jobs, cache writes) that intentionally need to bypass RLS.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
