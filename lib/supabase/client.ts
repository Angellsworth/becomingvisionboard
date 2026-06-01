import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function createBrowserClient(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function createClient(): SupabaseClient | null {
  return createBrowserClient()
}
