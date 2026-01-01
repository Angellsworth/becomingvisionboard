"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, CalendarDays } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-md border-b border-silver/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-light tracking-wide text-ink">Becoming 2026</h1>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive("/") && !pathname.includes("/month")
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
          </div>
        </div>
      </div>
    </nav>
  )
}
