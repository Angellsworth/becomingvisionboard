// Reflection Journal — curated prompts + free-form writing,
// stored as a single chronological feed in localStorage.

import { useCallback, useEffect, useMemo, useState } from "react"
import { playSound } from "@/lib/audio/engine"

export interface JournalEntry {
  id: string
  /** The prompt the user wrote into. Empty string = free-form entry. */
  prompt: string
  body: string
  /** ISO date string (YYYY-MM-DD) the entry is "about". */
  isoDate: string
  createdAt: number
  updatedAt: number
}

// Curated prompt rotation. One per day, picked deterministically so
// the prompt stays constant from midnight to midnight.
const PROMPTS: string[] = [
  "What am I becoming?",
  "What did I learn today?",
  "What am I letting go of?",
  "What made me feel alive?",
  "What needs my attention?",
  "What am I tending?",
  "Where did I notice grace?",
  "What surprised me?",
  "What is asking to be written?",
  "Who am I when no one is watching?",
  "What did my body tell me today?",
  "What am I quietly proud of?",
  "What am I not saying out loud?",
  "What does this season ask of me?",
]

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 0)
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.floor((now - start) / 86_400_000)
}

export function promptForDate(date: Date): string {
  return PROMPTS[dayOfYear(date) % PROMPTS.length]
}

export function isoDate(date: Date): string {
  // Use local date (not UTC) so the day boundary matches the user's wall clock.
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function prettyDate(iso: string): string {
  // Parse manually to avoid TZ shift.
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10))
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

const STORAGE_KEY = "becoming-journal"
const MIGRATION_KEY = "becoming-journal-migrated-v1"

function read(): JournalEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as JournalEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: JournalEntry[]): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch (e) {
    console.warn("[journal] write failed", e)
    return false
  }
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const journalStore = {
  list(): JournalEntry[] {
    // Newest day first, then newest updatedAt within a day.
    return [...read()].sort((a, b) => {
      if (a.isoDate !== b.isoDate) return a.isoDate < b.isoDate ? 1 : -1
      return b.updatedAt - a.updatedAt
    })
  },

  /** Find or create the entry for a given (prompt, isoDate) combo. */
  ensureFor(prompt: string, iso: string): JournalEntry {
    const items = read()
    const found = items.find((e) => e.prompt === prompt && e.isoDate === iso)
    if (found) return found
    const now = Date.now()
    const entry: JournalEntry = {
      id: genId(),
      prompt,
      body: "",
      isoDate: iso,
      createdAt: now,
      updatedAt: now,
    }
    write([entry, ...items])
    return entry
  },

  createFreeForm(iso: string): JournalEntry | null {
    const now = Date.now()
    const entry: JournalEntry = {
      id: genId(),
      prompt: "",
      body: "",
      isoDate: iso,
      createdAt: now,
      updatedAt: now,
    }
    if (!write([entry, ...read()])) return null
    return entry
  },

  update(id: string, patch: Partial<Pick<JournalEntry, "body" | "prompt">>): boolean {
    const items = read()
    const idx = items.findIndex((e) => e.id === id)
    if (idx === -1) return false
    items[idx] = { ...items[idx], ...patch, updatedAt: Date.now() }
    return write(items)
  },

  remove(id: string): void {
    write(read().filter((e) => e.id !== id))
  },
}

/**
 * One-shot import from the legacy monthly-reflection localStorage keys.
 * Each old reflection had three fields (helped / resisted / adjust);
 * non-empty ones become individual journal entries dated mid-month,
 * with the original question as the prompt.
 */
export function migrateMonthlyReflectionsToJournal(): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(MIGRATION_KEY)) return

    const MONTHS = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ]
    const monthSlugToNumber = (s: string) => MONTHS.indexOf(s) + 1

    const fields: Array<[keyof { helped: string; resisted: string; adjust: string }, string]> = [
      ["helped", "What helped?"],
      ["resisted", "What resisted?"],
      ["adjust", "What did I want to adjust?"],
    ]

    const existing = read()
    const collected: JournalEntry[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      const m = key.match(/^reflection-([a-z]+)-(\d{4})$/)
      if (!m) continue
      const monthSlug = m[1]
      const year = parseInt(m[2], 10)
      const monthNum = monthSlugToNumber(monthSlug)
      if (monthNum < 1) continue
      try {
        const obj = JSON.parse(localStorage.getItem(key) || "{}") as {
          helped?: string
          resisted?: string
          adjust?: string
        }
        const iso = `${year}-${String(monthNum).padStart(2, "0")}-15`
        const baseTimestamp = new Date(year, monthNum - 1, 15).getTime()
        for (const [field, prompt] of fields) {
          const body = (obj as Record<string, string | undefined>)[field]?.trim()
          if (!body) continue
          // Skip if we already have one — idempotency under repeat migration.
          if (existing.some((e) => e.isoDate === iso && e.prompt === prompt && e.body === body)) {
            continue
          }
          collected.push({
            id: `legacy-${baseTimestamp}-${field}-${Math.random().toString(36).slice(2, 6)}`,
            prompt,
            body,
            isoDate: iso,
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
          })
        }
      } catch {
        // skip corrupt entries
      }
    }

    if (collected.length > 0) {
      write([...collected, ...existing])
    }
    localStorage.setItem(MIGRATION_KEY, "1")
  } catch {
    // ignore
  }
}

// --- React hook -----------------------------------------------------------

export function useJournal() {
  const [items, setItems] = useState<JournalEntry[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [today, setToday] = useState<Date | null>(null)

  useEffect(() => {
    migrateMonthlyReflectionsToJournal()
    setItems(journalStore.list())
    setToday(new Date())
    setHydrated(true)
  }, [])

  const refresh = useCallback(() => setItems(journalStore.list()), [])

  const todayIso = today ? isoDate(today) : ""
  const todayPrompt = today ? promptForDate(today) : ""

  // Find (don't auto-create) today's prompt entry so the field is
  // shown as empty until the user actually writes.
  const todayEntry = useMemo(() => {
    if (!today) return null
    return items.find((e) => e.isoDate === todayIso && e.prompt === todayPrompt) ?? null
  }, [items, today, todayIso, todayPrompt])

  const otherEntries = useMemo(() => {
    if (!todayEntry) return items
    return items.filter((e) => e.id !== todayEntry.id)
  }, [items, todayEntry])

  const writeToday = useCallback(
    (body: string) => {
      if (!today) return
      const wasNew = !todayEntry
      // Lazily create the today entry on first keystroke.
      const entry = todayEntry ?? journalStore.ensureFor(todayPrompt, todayIso)
      journalStore.update(entry.id, { body })
      // First keystroke of the day → soft bloom chime.
      if (wasNew && body.trim().length > 0) {
        playSound("bloom")
      }
      refresh()
    },
    [today, todayEntry, todayPrompt, todayIso, refresh],
  )

  const addFreeForm = useCallback((): JournalEntry | null => {
    if (!today) return null
    const created = journalStore.createFreeForm(todayIso)
    if (created) playSound("bloom")
    refresh()
    return created
  }, [today, todayIso, refresh])

  const updateBody = useCallback(
    (id: string, body: string) => {
      journalStore.update(id, { body })
      refresh()
    },
    [refresh],
  )

  const removeEntry = useCallback(
    (id: string) => {
      journalStore.remove(id)
      refresh()
    },
    [refresh],
  )

  return {
    items,
    hydrated,
    today,
    todayIso,
    todayPrompt,
    todayEntry,
    otherEntries,
    writeToday,
    addFreeForm,
    updateBody,
    removeEntry,
  }
}
