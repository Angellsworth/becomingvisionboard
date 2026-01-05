"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, CalendarDays, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-md border-b border-silver/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={user ? "/home" : "/"} className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-light tracking-wide text-ink">Becoming 2026</h1>
          </Link>

          <div className="flex items-center gap-1">
            {user && (
              <>
                <Link
                  href="/home"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/home")
                      ? "bg-pacific-blue text-white"
                      : "text-ink hover:text-dusk-blue hover:bg-grape-soda/20",
                  )}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Annual</span>
                </Link>

                <Link
                  href="/months"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname.includes("/month")
                      ? "bg-pacific-blue text-white"
                      : "text-ink hover:text-dusk-blue hover:bg-grape-soda/20",
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Months</span>
                </Link>

                <Link
                  href="/year-overview"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/year-overview")
                      ? "bg-pacific-blue text-white"
                      : "text-ink hover:text-dusk-blue hover:bg-grape-soda/20",
                  )}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors text-ink hover:text-vintage-berry hover:bg-vintage-berry/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

            {!user && (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors text-ink hover:text-dusk-blue hover:bg-grape-soda/20"
                >
                  Login
                </Link>

                <Link
                  href="/auth/sign-up"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors bg-pacific-blue text-white hover:bg-dusk-blue"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
