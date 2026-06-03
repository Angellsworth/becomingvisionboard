import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Supabase renamed the legacy `anon` JWT to `publishable_key` (sb_publishable_*).
// Accept either env var name so projects bootstrapped under either era work.
function getSupabaseKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseKey())
}

export function createBrowserClient(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null
  return createSupabaseBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseKey()!)
}

export function createClient(): SupabaseClient | null {
  return createBrowserClient()
}
