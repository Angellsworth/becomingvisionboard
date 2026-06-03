"use client"

import { ChipField } from "@/components/chip-field"
import { ListField } from "@/components/list-field"
import { useFutureSelf } from "@/lib/data/future-self"

// Soft suggestion sets, used on empty fields to make first-touch feel less blank.
const VALUE_SUGGESTIONS = [
  "presence",
  "tenderness",
  "freedom",
  "creativity",
  "honesty",
  "rest",
  "wonder",
  "discipline",
  "grace",
]
const TRAIT_SUGGESTIONS = [
  "patient",
  "warm",
  "discerning",
  "playful",
  "grounded",
  "brave",
  "curious",
  "luminous",
]
const ROUTINE_SUGGESTIONS = [
  "Morning pages, ten quiet minutes",
  "A walk before the sun is high",
  "Tea instead of a third coffee",
  "Phone outside the bedroom",
]
const GOAL_SUGGESTIONS = [
  "Move my body in a way that feels alive, three times a week",
  "Finish the story I keep rewriting in my head",
  "Save quietly toward the trip I keep dreaming about",
]

export function FutureSelfProfile() {
  const { profile, setField, hydrated } = useFutureSelf()

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-12 md:pb-16 space-y-10 md:space-y-14">
      {/* ─── Header ─── */}
      <header>
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <span className="section-mark" aria-hidden />
          <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-primary">
            Future Self
          </p>
        </div>
        <h1 className="font-display text-5xl md:text-7xl tracking-[0.04em] leading-[1.02] text-foreground">
          The woman you are becoming
        </h1>
        <p className="mt-3 md:mt-4 font-serif italic text-base md:text-lg text-foreground/70 max-w-prose">
          A portrait, not a checklist. Edit anything as you go — she is allowed to change her mind.
        </p>
      </header>

      {/* ─── Vision statement ─── */}
      <Section
        eyebrow="Vision"
        title="What she is, written in her own voice"
        whisper="Speak in the present tense — &quot;I am&quot; not &quot;I will be.&quot;"
      >
        <textarea
          value={profile.visionStatement}
          onChange={(e) => setField("visionStatement", e.target.value)}
          placeholder={
            hydrated
              ? "I am a woman who moves through her days slowly. I take long walks. I tell the truth. I am at home in my own skin…"
              : ""
          }
          rows={6}
          className="w-full bg-card/60 border border-border rounded-2xl px-5 md:px-6 py-5 md:py-6 font-serif text-lg md:text-xl text-foreground placeholder:text-foreground/35 leading-relaxed resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </Section>

      {/* ─── Values + Traits side-by-side on desktop ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
        <Section eyebrow="Values" title="What she stands on">
          <ChipField
            values={profile.values}
            onChange={(next) => setField("values", next)}
            placeholder="presence"
            suggestions={VALUE_SUGGESTIONS}
          />
        </Section>
        <Section eyebrow="Traits" title="The qualities she's cultivating">
          <ChipField
            values={profile.traits}
            onChange={(next) => setField("traits", next)}
            placeholder="patient"
            suggestions={TRAIT_SUGGESTIONS}
          />
        </Section>
      </div>

      {/* ─── Routines ─── */}
      <Section eyebrow="Rhythms" title="The shape of her days" whisper="Small, repeatable, sacred.">
        <ListField
          items={profile.routines}
          onChange={(next) => setField("routines", next)}
          placeholder="A walk before the sun is high"
          suggestions={ROUTINE_SUGGESTIONS}
        />
      </Section>

      {/* ─── Personal style ─── */}
      <Section eyebrow="Style" title="The way she shows up">
        <textarea
          value={profile.personalStyle}
          onChange={(e) => setField("personalStyle", e.target.value)}
          placeholder="Linen in summer. The same gold hoop earrings every day. A coat she splurged on once and wears forever…"
          rows={4}
          className="w-full bg-card/60 border border-border rounded-2xl px-5 md:px-6 py-5 md:py-6 font-serif text-base md:text-lg text-foreground placeholder:text-foreground/35 leading-relaxed resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </Section>

      {/* ─── Goals ─── */}
      <Section
        eyebrow="What she is calling in"
        title="Goals, tied gently to seasons"
        whisper="Not deadlines. Directions."
      >
        <ListField
          items={profile.goals}
          onChange={(next) => setField("goals", next)}
          placeholder="Move my body three times a week"
          suggestions={GOAL_SUGGESTIONS}
        />
      </Section>

      {/* ─── Anchor ─── */}
      <Section
        eyebrow="Anchor"
        title="The thing she returns to"
        whisper="A line, a lyric, a mantra. Whatever steadies her."
      >
        <div className="relative rounded-2xl border border-border bg-card/70 px-6 md:px-10 py-8 md:py-10 overflow-hidden">
          <span
            aria-hidden
            className="absolute top-3 left-4 font-display text-7xl md:text-9xl leading-none text-primary/15 select-none pointer-events-none"
          >
            &ldquo;
          </span>
          <textarea
            value={profile.anchor}
            onChange={(e) => setField("anchor", e.target.value)}
            placeholder="There is a tide in the affairs of women…"
            rows={3}
            className="relative w-full bg-transparent font-serif italic text-xl md:text-3xl text-foreground placeholder:text-foreground/35 leading-snug resize-none focus:outline-none"
          />
        </div>
      </Section>

      <footer className="pt-4 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-foreground/40">
          Saved as you write
        </p>
      </footer>
    </div>
  )
}

// --- Section primitive ----------------------------------------------------

interface SectionProps {
  eyebrow: string
  title: string
  whisper?: string
  children: React.ReactNode
}

function Section({ eyebrow, title, whisper, children }: SectionProps) {
  return (
    <section className="space-y-4 md:space-y-5">
      <div className="space-y-1">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary">{eyebrow}</p>
        <h2 className="font-serif text-2xl md:text-3xl text-foreground">{title}</h2>
        {whisper && (
          <p className="text-sm md:text-base text-foreground/60 italic font-serif">{whisper}</p>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}
