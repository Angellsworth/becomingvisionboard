import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  // If Supabase env vars are not configured, skip auth gating entirely.
  // The app falls back to localStorage-only mode.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
