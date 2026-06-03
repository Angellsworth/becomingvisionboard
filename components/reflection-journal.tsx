"use client"

import { useCallback, useState } from "react"
import { Feather, Plus } from "lucide-react"
import { TodayPrompt } from "@/components/today-prompt"
import { JournalEntryCard } from "@/components/journal-entry-card"
import { prettyDate, useJournal } from "@/lib/data/journal"

export function ReflectionJournal() {
  const {
    hydrated,
    today,
    todayPrompt,
    todayEntry,
    otherEntries,
    writeToday,
    addFreeForm,
    updateBody,
    removeEntry,
  } = useJournal()

  // Track which entry ids were just created so we auto-expand them on render.
  const [justCreated, setJustCreated] = useState<Set<string>>(new Set())

  const handleAddFreeForm = useCallback(() => {
    const created = addFreeForm()
    if (created) {
      setJustCreated((prev) => new Set(prev).add(created.id))
      // Smooth scroll into view if the page is long.
      requestAnimationFrame(() => {
        const el = document.getElementById(`entry-${created.id}`)
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    }
  }, [addFreeForm])

  if (!hydrated || !today) {
    // Show a soft skeleton instead of nothing — same height as the prompt card.
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-24 md:pb-16">
        <div className="rounded-3xl border border-border bg-card/40 h-64" />
      </div>
    )
  }

  const dateLine = prettyDate(today.toISOString().slice(0, 10))

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-24 md:pb-16">
      {/* ─── Header ─── */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-mark" aria-hidden />
          <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-primary">
            Reflection
          </p>
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-[0.04em] leading-[1.02] text-foreground">
          Pages turned
        </h1>
        <p className="mt-3 font-serif italic text-base md:text-lg text-foreground/70 max-w-prose">
          Begin where you are. Every entry quietly waters the garden.
        </p>
      </header>

      {/* ─── Today's prompt ─── */}
      <TodayPrompt
        prompt={todayPrompt}
        dateLine={dateLine}
        initialBody={todayEntry?.body ?? ""}
        onWrite={writeToday}
      />

      {/* ─── Write freely ─── */}
      <div className="my-6 md:my-8 flex justify-center">
        <button
          type="button"
          onClick={handleAddFreeForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card/60 hover:bg-card hover:border-primary/40 text-foreground/80 hover:text-primary transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Capture something else
        </button>
      </div>

      {/* ─── Past entries ─── */}
      {otherEntries.length > 0 ? (
        <section className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="section-mark" aria-hidden />
            <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/55">
              Earlier pages
            </p>
          </div>
          {otherEntries.map((entry) => (
            <div key={entry.id} id={`entry-${entry.id}`}>
              <JournalEntryCard
                entry={entry}
                onChange={(body) => updateBody(entry.id, body)}
                onRemove={() => {
                  removeEntry(entry.id)
                  setJustCreated((prev) => {
                    const next = new Set(prev)
                    next.delete(entry.id)
                    return next
                  })
                }}
                autoExpand={justCreated.has(entry.id)}
              />
            </div>
          ))}
        </section>
      ) : (
        <EmptyTimelineHint />
      )}
    </div>
  )
}

function EmptyTimelineHint() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card/30 backdrop-blur-sm py-10 px-6 text-center">
      <div className="inline-flex w-12 h-12 rounded-full bg-primary/12 text-primary items-center justify-center mb-3">
        <Feather className="w-5 h-5" />
      </div>
      <p className="font-serif italic text-foreground/65 max-w-md mx-auto">
        Your earlier pages will gather here, in the order you wrote them.
      </p>
    </div>
  )
}
