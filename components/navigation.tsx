"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, CalendarDays, LogOut, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useYear } from "@/components/year-provider"
import { YearSelector } from "@/components/year-selector"

export function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const authEnabled = hasSupabaseEnv()
  const { year } = useYear()

  useEffect(() => {
    if (!authEnabled) return
    const supabase = createBrowserClient()
    if (!supabase) return

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [authEnabled])

  // When auth is disabled (no env vars), treat the user as signed-in so the
  // app's main features are accessible — localStorage is the data store.
  const showAppLinks = !authEnabled || Boolean(user)

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    if (supabase) await supabase.auth.signOut()
    window.location.href = "/"
  }

  const isActive = (path: string) => pathname === path

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
      active
        ? "bg-pacific-blue text-white"
        : "text-ink hover:text-dusk-blue hover:bg-grape-soda/20",
    )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-md border-b border-silver/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={showAppLinks ? "/home" : "/"} className="flex items-center gap-3">
            <h1 className="font-serif text-xl sm:text-2xl font-light tracking-wide text-ink">
              Becoming <span className="tabular-nums">{year}</span>
            </h1>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {showAppLinks && <YearSelector />}
            {showAppLinks && (
              <>
                <Link href="/home" className={linkClass(isActive("/home"))}>
                  <Home className="w-4 h-4" />
                  <span>Annual</span>
                </Link>
                <Link href="/months" className={linkClass(pathname.includes("/month"))}>
                  <Calendar className="w-4 h-4" />
                  <span>Months</span>
                </Link>
                <Link href="/year-overview" className={linkClass(isActive("/year-overview"))}>
                  <CalendarDays className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                {authEnabled && user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors text-ink hover:text-vintage-berry hover:bg-vintage-berry/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </>
            )}

            {authEnabled && !user && (
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

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 text-ink hover:text-dusk-blue"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1 border-t border-silver/30 pt-3">
            {showAppLinks && (
              <div className="flex justify-center pb-2">
                <YearSelector />
              </div>
            )}
            {showAppLinks && (
              <>
                <Link href="/home" onClick={() => setMobileOpen(false)} className={linkClass(isActive("/home"))}>
                  <Home className="w-4 h-4" />
                  <span>Annual</span>
                </Link>
                <Link
                  href="/months"
                  onClick={() => setMobileOpen(false)}
                  className={linkClass(pathname.includes("/month"))}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Months</span>
                </Link>
                <Link
                  href="/year-overview"
                  onClick={() => setMobileOpen(false)}
                  className={linkClass(isActive("/year-overview"))}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                {authEnabled && user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors text-ink hover:text-vintage-berry hover:bg-vintage-berry/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </>
            )}
            {authEnabled && !user && (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-ink hover:text-dusk-blue hover:bg-grape-soda/20"
                >
                  Login
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-pacific-blue text-white hover:bg-dusk-blue"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
