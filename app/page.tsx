"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { quoteForDate } from "@/lib/quotes"
import { Frame, UserRound, Target, Feather, Flower2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const PILLARS = [
  { icon: Frame, label: "Becoming Board", line: "Vision in pictures." },
  { icon: UserRound, label: "Future Self", line: "Who you are becoming." },
  { icon: Target, label: "Life Projects", line: "Threads in motion." },
  { icon: Feather, label: "Reflection", line: "Today's quiet page." },
  { icon: Flower2, label: "Memory Garden", line: "What you tend, blooms." },
]

export default function LandingPage() {
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => setToday(new Date()), [])
  const quote = quoteForDate(today ?? new Date(0))

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-20 md:pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          {/* Hero */}
          <div className="text-center">
            <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-primary mb-6">
              A becoming dashboard
            </p>
            <h1 className="font-display text-6xl md:text-8xl tracking-[0.04em] leading-[1.02] text-foreground">
              Becoming
            </h1>
            <p className="mt-6 md:mt-8 font-serif italic text-xl md:text-2xl text-foreground/75 max-w-2xl mx-auto leading-relaxed">
              She is not starting over. <br className="hidden sm:inline" />
              She is becoming.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-primary hover:opacity-90 text-primary-foreground font-medium">
                <Link href="/auth/sign-up">Begin your becoming</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-card/60 bg-transparent"
              >
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Today's quote */}
          {today && (
            <div className="mt-16 md:mt-24 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="section-mark" aria-hidden />
                <p className="text-xs tracking-[0.3em] uppercase text-primary">A word for today</p>
                <span className="section-mark" aria-hidden />
              </div>
              <blockquote className="font-serif italic text-xl md:text-2xl leading-relaxed text-foreground/85 text-center">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <p className="text-center text-sm text-foreground/55 mt-3">— {quote.author}</p>
            </div>
          )}

          {/* Pillars */}
          <div className="mt-20 md:mt-28">
            <p className="text-center text-xs tracking-[0.3em] uppercase text-primary mb-10">
              What lives inside
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {PILLARS.map(({ icon: Icon, label, line }) => (
                <div
                  key={label}
                  className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/12 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground">{label}</h3>
                    <p className="text-sm text-foreground/60">{line}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Closing */}
          <div className="text-center mt-20 md:mt-28 pt-12 border-t border-border/60">
            <p className="font-serif italic text-base md:text-lg text-foreground/65 max-w-xl mx-auto">
              No streaks. No pressure. <br />
              A quiet, beautiful place to come home to.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
