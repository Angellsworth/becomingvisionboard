"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Frame,
  UserRound,
  Target,
  Feather,
  Flower2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { AudioToggle } from "@/components/audio-toggle"

/**
 * Six sections of the app:
 * - Home (the dashboard you open every morning)
 * - Board (Pinterest-style becoming board)
 * - Future Self (the profile you are becoming)
 * - Projects (life projects with progress)
 * - Reflection (journal + prompts)
 * - Garden (the sacred space that grows with your activity)
 */
const SECTIONS = [
  { path: "/home", label: "Home", icon: Sparkles },
  { path: "/board", label: "Board", icon: Frame },
  { path: "/future-self", label: "Future Self", icon: UserRound },
  { path: "/projects", label: "Projects", icon: Target },
  { path: "/reflection", label: "Reflection", icon: Feather },
  { path: "/garden", label: "Garden", icon: Flower2 },
] as const

export function Navigation() {
  const pathname = usePathname()
  const { user, authEnabled, signOut } = useAuth()

  // When auth is off (no Supabase env) we still treat the visitor as "in the app"
  // so localStorage-only mode is usable without a signup gate.
  const inApp = !authEnabled || Boolean(user)

  if (!inApp) return <PublicNav />

  return <AppNav pathname={pathname} authEnabled={authEnabled} user={user} signOut={signOut} />
}

interface AppNavProps {
  pathname: string
  authEnabled: boolean
  user: { id: string; email?: string } | null
  signOut: () => Promise<void>
}

function AppNav({ pathname, user }: AppNavProps) {
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  return (
    <>
      {/* === Desktop top bar === */}
      <nav className="fixed top-0 inset-x-0 z-40 hidden md:flex h-16 items-center justify-between px-8 bg-background/70 backdrop-blur-xl border-b border-border">
        <Link
          href="/home"
          className="font-display text-2xl tracking-[0.18em] text-foreground hover:text-primary transition-colors"
        >
          Becoming
        </Link>
        <div className="flex items-center gap-1">
          {SECTIONS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
                isActive(path)
                  ? "bg-primary/12 text-primary font-medium"
                  : "text-foreground/70 hover:text-foreground hover:bg-card/60",
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <AudioToggle />
          <ThemeToggle />
          <ProfileChip pathname={pathname} email={user?.email ?? null} />
        </div>
      </nav>

      {/* === Mobile top bar === */}
      <nav className="fixed top-0 inset-x-0 z-40 md:hidden h-14 flex items-center justify-between px-5 bg-background/80 backdrop-blur-xl border-b border-border">
        <Link href="/home" className="font-display text-xl tracking-[0.18em] text-foreground">
          Becoming
        </Link>
        <div className="flex items-center gap-1">
          <AudioToggle />
          <ThemeToggle />
          <ProfileChip pathname={pathname} email={user?.email ?? null} />
        </div>
      </nav>

      {/* === Mobile bottom tab bar === */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 md:hidden grid grid-cols-6 gap-1 px-2 pt-1.5 bg-background/85 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {SECTIONS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-all",
                active ? "text-primary" : "text-foreground/55",
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", active && "scale-110")} />
              <span className="text-[10px] tracking-wide font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

interface ProfileChipProps {
  pathname: string
  email: string | null
}

function ProfileChip({ pathname, email }: ProfileChipProps) {
  const [displayName, setDisplayName] = useState<string | null>(null)
  useEffect(() => {
    try {
      setDisplayName(localStorage.getItem("becoming-display-name"))
    } catch {
      // ignore
    }
  }, [])

  // Use display name initial, else email initial, else fallback
  const source = displayName || email || ""
  const initial = source ? source.trim()[0].toUpperCase() : "•"
  const active = pathname.startsWith("/profile")

  return (
    <Link
      href="/profile"
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full border transition-all font-serif text-base",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card/60 text-foreground hover:border-primary/60 hover:bg-card",
      )}
      aria-label="Open profile"
    >
      {initial}
    </Link>
  )
}

function PublicNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 h-16 flex items-center justify-between px-5 md:px-8 bg-background/70 backdrop-blur-xl border-b border-border">
      <Link
        href="/"
        className="font-display text-xl md:text-2xl tracking-[0.18em] text-foreground hover:text-primary transition-colors"
      >
        Becoming
      </Link>
      <div className="flex items-center gap-1 md:gap-2">
        <AudioToggle />
        <ThemeToggle />
        <Link
          href="/auth/login"
          className="hidden sm:inline-flex px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="px-4 py-1.5 text-sm rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
        >
          Begin
        </Link>
      </div>
    </nav>
  )
}
