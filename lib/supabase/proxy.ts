import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function getSupabaseKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const key = getSupabaseKey()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if accessing protected routes without authentication
  const protectedPaths = [
    "/home",
    "/board",
    "/future-self",
    "/projects",
    "/reflection",
    "/garden",
    "/profile",
    // Legacy routes still reachable for data continuity
    "/months",
    "/year-overview",
  ]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect to home if accessing auth pages while logged in
  if (request.nextUrl.pathname.startsWith("/auth") && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/home"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
