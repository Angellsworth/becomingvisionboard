"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait for client-side hydration so we don't render the wrong icon and trigger a mismatch.
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={cn("w-10 h-10", className)} aria-hidden />
  }

  const current = (theme === "system" ? resolvedTheme : theme) ?? "light"
  const isDark = current === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full",
        "text-foreground/70 hover:text-foreground hover:bg-card/60 transition-colors",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
