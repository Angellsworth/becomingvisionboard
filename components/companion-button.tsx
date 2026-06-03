"use client"

import { Sparkles } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { useCompanion } from "@/components/companion-provider"

/**
 * Floating button that opens the Becoming Companion panel.
 * Hidden on auth pages and the public landing — the companion is for
 * signed-in app sessions (or localStorage-only sessions when Supabase
 * is unconfigured).
 */
export function CompanionButton() {
  const pathname = usePathname()
  const { user, authEnabled } = useAuth()
  const { open, toggle } = useCompanion()

  const inApp = !authEnabled || Boolean(user)
  const isAuthRoute = pathname.startsWith("/auth")
  const isLanding = pathname === "/"

  if (!inApp || isAuthRoute || isLanding) return null

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Close companion" : "Ask the companion"}
      aria-expanded={open}
      className={cn(
        "fixed z-40 right-5 md:right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-all hover:opacity-95 hover:scale-105",
        "bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8",
      )}
    >
      <Sparkles className="w-6 h-6" />
      {/* gentle pulse ring when closed */}
      {!open && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping pointer-events-none"
          style={{ animationDuration: "3.5s" }}
        />
      )}
    </button>
  )
}
