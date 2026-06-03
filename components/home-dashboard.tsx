"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Flower2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { quoteForDate } from "@/lib/quotes"
import { currentSeason, formattedDate, greetingFor, isoDate } from "@/lib/season"

// --- Mood model -----------------------------------------------------------

interface Mood {
  id: string
  label: string
  dot: string // tailwind bg-* token
}

// Mood dots keep fixed editorial colors so the moods carry consistent meaning
// across palettes (Tender always reads as soft rose, etc.).
const MOODS: Mood[] = [
  { id: "tender", label: "Tender", dot: "bg-dusty-rose" },
  { id: "steady", label: "Steady", dot: "bg-sage" },
  { id: "glowing", label: "Glowing", dot: "bg-honey" },
  { id: "stirring", label: "Stirring", dot: "bg-terracotta" },
  { id: "vast", label: "Vast", dot: "bg-aubergine" },
]

// --- Component ------------------------------------------------------------

export function HomeDashboard() {
  const { user } = useAuth()
  const [now, setNow] = useState<Date | null>(null)
  const [intention, setIntention] = useState("")
  const [mood, setMood] = useState<string | null>(null)
  const [editingIntention, setEditingIntention] = useState(false)

  // Initialize Date on the client only, to keep SSR/CSR consistent.
  useEffect(() => {
    setNow(new Date())
  }, [])

  // Today's storage key (changes daily).
  const todayKey = useMemo(() => (now ? isoDate(now) : ""), [now])

  useEffect(() => {
    if (!todayKey) return
    try {
      setIntention(localStorage.getItem(`intention-${todayKey}`) ?? "")
      setMood(localStorage.getItem(`mood-${todayKey}`))
    } catch {
      // ignore
    }
  }, [todayKey])

  const saveIntention = (next: string) => {
    setIntention(next)
    if (!todayKey) return
    try {
      localStorage.setItem(`intention-${todayKey}`, next)
    } catch {
      // ignore
    }
  }

  const pickMood = (id: string) => {
    setMood((prev) => {
      const next = prev === id ? null : id
      if (todayKey) {
        try {
          if (next) localStorage.setItem(`mood-${todayKey}`, next)
          else localStorage.removeItem(`mood-${todayKey}`)
        } catch {
          // ignore
        }
      }
      return next
    })
  }

  // SSR-safe defaults until `now` is set.
  const safeNow = now ?? new Date(0)
  const greeting = now ? greetingFor(safeNow) : "Welcome back"
  const dateLine = now ? formattedDate(safeNow) : ""
  const season = currentSeason(safeNow)
  const quote = quoteForDate(safeNow)

  // First name from email, only if we have a real user.
  const firstName = user?.email ? user.email.split("@")[0].split(/[._-]/)[0] : null
  const greetingFull = firstName ? `${greeting}, ${cap(firstName)}.` : `${greeting}.`

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-12 md:pb-16">
      {/* ─── Hero ────────────────────────────────────────────────── */}
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <span className="section-mark" aria-hidden />
          <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-primary">
            {dateLine || "Today"}
          </p>
        </div>
        <h1 className="font-display text-5xl md:text-7xl tracking-[0.04em] leading-[1.02] text-foreground">
          {greetingFull}
        </h1>
        <p className="mt-3 md:mt-4 font-serif italic text-lg md:text-xl text-foreground/70">
          She is not starting over. She is becoming.
        </p>
      </header>

      {/* ─── Intention card ────────────────────────────────────────── */}
      <section className="mb-8 md:mb-12">
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden">
          <div className="px-6 md:px-8 py-6 md:py-8">
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">
              Today I am becoming
            </p>
            {editingIntention ? (
              <textarea
                value={intention}
                onChange={(e) => saveIntention(e.target.value)}
                onBlur={() => setEditingIntention(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setEditingIntention(false)
                  }
                }}
                placeholder="someone who…"
                autoFocus
                rows={2}
                className="w-full bg-transparent font-serif text-2xl md:text-4xl leading-snug text-foreground placeholder:text-foreground/30 resize-none focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingIntention(true)}
                className="w-full text-left font-serif text-2xl md:text-4xl leading-snug text-foreground hover:text-primary transition-colors"
              >
                {intention || (
                  <span className="text-foreground/35 italic font-serif">someone who…</span>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3-up: Season · Mood · Garden ──────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <SeasonCard season={season} />
        <MoodCard mood={mood} onPick={pickMood} />
        <GardenPreviewCard />
      </section>

      {/* ─── Daily quote ──────────────────────────────────────────── */}
      <section className="mb-8 md:mb-12">
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm px-6 md:px-10 py-8 md:py-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">
            Today's quote
          </p>
          <blockquote className="font-serif text-2xl md:text-4xl leading-tight text-foreground italic">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <footer className="mt-4 text-sm md:text-base text-foreground/60 tracking-wide">
            — {quote.author}
          </footer>
        </div>
      </section>

      {/* ─── Wayfinding ──────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <WayfindCard href="/board" label="Becoming Board" hint="Vision in pictures" />
        <WayfindCard href="/future-self" label="Future Self" hint="Who you are becoming" />
        <WayfindCard href="/projects" label="Life Projects" hint="Threads in motion" />
        <WayfindCard href="/reflection" label="Reflection" hint="Today's page" />
      </section>
    </div>
  )
}

// --- Sub-cards -----------------------------------------------------------

function SeasonCard({ season }: { season: ReturnType<typeof currentSeason> }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-6 py-6 md:py-7">
      <p className="text-[10px] tracking-[0.3em] uppercase text-primary">Current Season</p>
      <h3 className="mt-2 font-display text-3xl md:text-4xl tracking-[0.04em] text-foreground">
        {season.display}
      </h3>
      <p className="mt-3 font-serif italic text-base text-foreground/65">{season.whisper}</p>
    </div>
  )
}

interface MoodCardProps {
  mood: string | null
  onPick: (id: string) => void
}

function MoodCard({ mood, onPick }: MoodCardProps) {
  const selected = MOODS.find((m) => m.id === mood)
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-6 py-6 md:py-7">
      <p className="text-[10px] tracking-[0.3em] uppercase text-primary">How you feel</p>
      <h3 className="mt-2 font-display text-3xl md:text-4xl tracking-[0.04em] text-foreground">
        {selected ? selected.label : "—"}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {MOODS.map((m) => {
          const isOn = m.id === mood
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m.id)}
              className={cn(
                "group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs tracking-wide transition-all",
                isOn
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border text-foreground/60 hover:text-foreground hover:bg-card",
              )}
              aria-pressed={isOn}
            >
              <span className={cn("w-2 h-2 rounded-full", m.dot)} aria-hidden />
              <span>{m.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GardenPreviewCard() {
  return (
    <Link
      href="/garden"
      className="group relative rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-6 py-6 md:py-7 overflow-hidden transition-all hover:border-primary/40 hover:bg-card"
    >
      <p className="text-[10px] tracking-[0.3em] uppercase text-primary">Your Garden</p>
      <h3 className="mt-2 font-display text-3xl md:text-4xl tracking-[0.04em] text-foreground">
        Tending
      </h3>
      <p className="mt-3 font-serif italic text-base text-foreground/65">
        A small living scene that grows with you.
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-primary">
        <Flower2 className="w-4 h-4" />
        <span>Visit garden</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
      {/* decorative sparkle */}
      <Sparkles className="absolute top-3 right-3 w-4 h-4 text-primary/30" aria-hidden />
    </Link>
  )
}

function WayfindCard({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1 rounded-xl border border-border bg-card/40 backdrop-blur-sm px-4 py-4 md:py-5 hover:border-primary/40 hover:bg-card transition-all"
    >
      <span className="font-serif text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
        {label}
      </span>
      <span className="text-xs text-foreground/55 tracking-wide">{hint}</span>
    </Link>
  )
}

// --- Helpers --------------------------------------------------------------

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
