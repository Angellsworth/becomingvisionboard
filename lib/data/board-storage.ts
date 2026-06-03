// localStorage CRUD for the Becoming Board.
// One key holds the full array, JSON-encoded. Items are sorted newest-first.

import { DEFAULT_SIZE, type BoardItem } from "./board-types"

const STORAGE_KEY = "becoming-board-items"
const MIGRATION_KEY = "becoming-board-migrated-v1"

function read(): BoardItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BoardItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: BoardItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota errors etc. — surface in console only.
    console.warn("[board] write failed (quota?)")
  }
}

export const board = {
  list(): BoardItem[] {
    return read().sort((a, b) => b.createdAt - a.createdAt)
  },

  add(partial: Omit<BoardItem, "id" | "createdAt" | "updatedAt">): BoardItem {
    const now = Date.now()
    const item: BoardItem = {
      ...partial,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    }
    write([item, ...read()])
    return item
  },

  update(id: string, patch: Partial<Omit<BoardItem, "id" | "createdAt">>): BoardItem | null {
    const items = read()
    const idx = items.findIndex((it) => it.id === id)
    if (idx === -1) return null
    const updated: BoardItem = { ...items[idx], ...patch, id, updatedAt: Date.now() }
    items[idx] = updated
    write(items)
    return updated
  },

  remove(id: string): void {
    write(read().filter((it) => it.id !== id))
  },

  clear(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
  },
}

/**
 * One-shot migration that seeds the Becoming Board with images saved
 * in the legacy annual-collage localStorage keys. Idempotent.
 *
 * The board is meant to be a lifetime canvas, so we collect images
 * across every year we find and stamp them into the new structure.
 * Positions/rotations/sizes get sensible defaults — the editorial
 * intent of an old layout doesn't carry forward, but the photos do.
 */
export function migrateAnnualCollagesToBoard(): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(MIGRATION_KEY)) return

    // Collect every old annual collage image across all years.
    const collected: { url: string; year: number }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      const m = key.match(/^collage-annual-(\d{4})$/)
      if (!m) continue
      const year = parseInt(m[1], 10)
      try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]")
        if (!Array.isArray(arr)) continue
        for (const old of arr) {
          if (old?.url && typeof old.url === "string") {
            collected.push({ url: old.url, year })
          }
        }
      } catch {
        // skip corrupt entries
      }
    }

    // Stamp them into the board in age order (oldest first → bottom of feed).
    const existing = read()
    if (collected.length > 0 && existing.length === 0) {
      const base = Date.now() - collected.length * 1000
      const seeded: BoardItem[] = collected.map((c, i) => ({
        id: `seed-${base + i}-${Math.random().toString(36).slice(2, 6)}`,
        imageUrl: c.url,
        caption: "",
        link: "",
        size: DEFAULT_SIZE,
        rotation: 0,
        createdAt: base + i,
        updatedAt: base + i,
      }))
      // Newest at top — reverse so legacy items appear at the bottom.
      write([...seeded].reverse())
    }

    localStorage.setItem(MIGRATION_KEY, "1")
  } catch {
    // ignore
  }
}
