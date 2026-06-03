// localStorage CRUD for the Becoming Board.
// One key holds the full array, JSON-encoded. Items are sorted newest-first.

import { compressDataUrl, approxByteSize } from "@/lib/image-compress"
import { DEFAULT_SIZE, type BoardItem } from "./board-types"

const STORAGE_KEY = "becoming-board-items"
const MIGRATION_KEY = "becoming-board-migrated-v1"
const SHRINK_KEY = "becoming-board-shrunk-v1"

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

/**
 * Persist the board. Returns false on quota error so the caller can
 * surface a user-visible message instead of dropping the write silently.
 */
function write(items: BoardItem[]): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch (e) {
    console.warn("[board] write failed (quota?)", e)
    return false
  }
}

export const board = {
  list(): BoardItem[] {
    return read().sort((a, b) => b.createdAt - a.createdAt)
  },

  /** Returns the new item, or null if the write was rejected (quota). */
  add(partial: Omit<BoardItem, "id" | "createdAt" | "updatedAt">): BoardItem | null {
    const now = Date.now()
    const item: BoardItem = {
      ...partial,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    }
    if (!write([item, ...read()])) return null
    return item
  },

  /** Returns updated item, or null on quota error / missing id. */
  update(id: string, patch: Partial<Omit<BoardItem, "id" | "createdAt">>): BoardItem | null {
    const items = read()
    const idx = items.findIndex((it) => it.id === id)
    if (idx === -1) return null
    const updated: BoardItem = { ...items[idx], ...patch, id, updatedAt: Date.now() }
    items[idx] = updated
    if (!write(items)) return null
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
 */
export function migrateAnnualCollagesToBoard(): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(MIGRATION_KEY)) return

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
      write([...seeded].reverse())
    }

    localStorage.setItem(MIGRATION_KEY, "1")
  } catch {
    // ignore
  }
}

/**
 * Second-pass migration: recompress any existing pin whose image is
 * larger than a soft cap. Idempotent — sets SHRINK_KEY when done.
 *
 * This frees up localStorage for users (early testers) who pinned
 * uncompressed phone photos before client-side compression was added.
 */
export async function shrinkOversizedPins(): Promise<{ shrunk: number; bytesSaved: number }> {
  if (typeof window === "undefined") return { shrunk: 0, bytesSaved: 0 }
  if (localStorage.getItem(SHRINK_KEY)) return { shrunk: 0, bytesSaved: 0 }

  const SOFT_CAP_BYTES = 300_000 // 300 KB — anything larger gets recompressed
  const items = read()
  if (items.length === 0) {
    localStorage.setItem(SHRINK_KEY, "1")
    return { shrunk: 0, bytesSaved: 0 }
  }

  let shrunk = 0
  let bytesSaved = 0
  const updated: BoardItem[] = []
  for (const item of items) {
    const beforeBytes = approxByteSize(item.imageUrl)
    if (beforeBytes > SOFT_CAP_BYTES) {
      try {
        const next = await compressDataUrl(item.imageUrl)
        const afterBytes = approxByteSize(next)
        if (afterBytes < beforeBytes) {
          updated.push({ ...item, imageUrl: next })
          shrunk += 1
          bytesSaved += beforeBytes - afterBytes
          continue
        }
      } catch {
        // fall through and keep original
      }
    }
    updated.push(item)
  }

  if (shrunk > 0) {
    write(updated)
  }
  localStorage.setItem(SHRINK_KEY, "1")
  return { shrunk, bytesSaved }
}
