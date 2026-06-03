// Derives the garden's growth signal from the things you've already
// tended elsewhere in the app. No new storage; reads directly from
// the existing journal + projects keys so the garden always reflects
// the truth of the rest of the app.

export interface GardenStats {
  /** Aggregate growth score that drives the scene. */
  tokens: number
  reflections: number
  tending: number
  complete: number
  milestones: number
}

export interface GardenPhase {
  /** Minimum tokens to enter this phase. */
  min: number
  name: string
  /** The line shown under the scene. */
  whisper: string
}

// Phases in order — find the highest one whose .min is ≤ tokens.
// The whispers narrate both the house and the garden as they grow together.
export const PHASES: GardenPhase[] = [
  { min: 0, name: "Quiet", whisper: "A plot of ground. Just beginning." },
  { min: 2, name: "Stirring", whisper: "A first stone. Something is rooting." },
  { min: 6, name: "Sprouting", whisper: "Walls finding their shape. Green things, breathing." },
  { min: 12, name: "Blooming", whisper: "A roof. A door. Tending becomes you." },
  { min: 22, name: "Tended", whisper: "Windows lit. The bees know your name." },
  { min: 38, name: "Sanctuary", whisper: "Smoke from the chimney. A whole life of you." },
]

/**
 * House construction stages keyed to token thresholds.
 * Each stage adds detail without un-drawing earlier detail.
 *   0 — foundation only (a plinth in the garden)
 *   1 — low walls + door frame
 *   2 — full walls + door + knob
 *   3 — roof
 *   4 — chimney + first window
 *   5 — smoke + second window + vines on the walls
 */
export function houseStageFor(tokens: number): number {
  if (tokens >= 38) return 5
  if (tokens >= 22) return 4
  if (tokens >= 12) return 3
  if (tokens >= 6) return 2
  if (tokens >= 2) return 1
  return 0
}

export function phaseFor(tokens: number): GardenPhase {
  let result = PHASES[0]
  for (const p of PHASES) {
    if (tokens >= p.min) result = p
  }
  return result
}

/**
 * Read garden state directly from localStorage. Synchronous; called
 * from inside useEffect so it never touches storage during SSR.
 */
export function computeGardenStats(): GardenStats {
  const stats: GardenStats = {
    tokens: 0,
    reflections: 0,
    tending: 0,
    complete: 0,
    milestones: 0,
  }
  if (typeof window === "undefined") return stats

  try {
    const raw = localStorage.getItem("becoming-journal")
    if (raw) {
      const arr = JSON.parse(raw) as Array<{ body?: string }>
      if (Array.isArray(arr)) {
        stats.reflections = arr.filter((e) => (e?.body ?? "").trim().length > 0).length
      }
    }
  } catch {
    // ignore
  }

  try {
    const raw = localStorage.getItem("becoming-projects")
    if (raw) {
      const arr = JSON.parse(raw) as Array<{
        status?: string
        milestones?: Array<{ done?: boolean }>
      }>
      if (Array.isArray(arr)) {
        for (const p of arr) {
          if (p?.status === "completed") stats.complete += 1
          else if (p?.status === "active") stats.tending += 1
          for (const m of p?.milestones ?? []) {
            if (m?.done) stats.milestones += 1
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // Token weighting:
  // - 1 token per reflection (small daily contribution)
  // - 0.5 per completed milestone
  // - 1 per active project (you are tending it)
  // - 3 per completed project (a milestone moment)
  stats.tokens = Math.floor(
    stats.reflections + stats.milestones * 0.5 + stats.tending + stats.complete * 3,
  )
  return stats
}

// Number of bees on the scene at a given growth level.
export function beeCountFor(tokens: number): number {
  if (tokens < 5) return 0
  if (tokens < 12) return 1
  if (tokens < 22) return 2
  if (tokens < 38) return 3
  return 4
}

// ===========================================================
// Garden items — flowers that mean something
// ===========================================================

/** Where this item came from in the rest of the app. */
export type GardenItemType = "complete" | "milestone" | "reflection" | "tending"

export interface GardenItem {
  id: string
  type: GardenItemType
  /** The main label shown in the hover tooltip. */
  title: string
  /** Smaller secondary line (category, date, etc.). */
  subtitle: string
  /** Hex color or CSS variable string for the flower fill. */
  tint: string
  /** Which flower shape: 0 tulip, 1 daisy, 2 cluster, 3 round, 4 sprout/bud. */
  flowerType: 0 | 1 | 2 | 3 | 4
  /** Base scale multiplier on top of the flower spot's own scale. */
  scale: number
}

// Category tints duplicated here from projects.ts to keep the garden
// independent of the projects module's React hook ergonomics. Used
// for sprouts (active projects) so the bud reads as that category's
// promise, while bloomed items pull from the wider wildflower palette
// below for a cacophony of colour.
const CATEGORY_INFO: Record<
  string,
  { label: string; tint: string }
> = {
  fitness: { label: "Fitness", tint: "#7c9468" },
  wellness: { label: "Wellness", tint: "#95a87a" },
  home: { label: "Home", tint: "#c47a5d" },
  career: { label: "Career", tint: "#b8924e" },
  creative: { label: "Creative", tint: "#92374d" },
  travel: { label: "Travel", tint: "#d9a5a8" },
  financial: { label: "Money", tint: "#e3c47a" },
  relationships: { label: "People", tint: "#e8b4b8" },
  other: { label: "Other", tint: "#b5b89c" },
}

/**
 * Wildflower palette — 15 vivid blooms across the chromatic wheel.
 * Bloomed items (completed projects, milestones, reflections) pick a
 * colour from this set via a deterministic hash of the item id, so each
 * bloom keeps its identity across sessions but the bed reads as a
 * gathered, varied bouquet rather than colour-coded categories.
 */
const WILDFLOWER_PALETTE = [
  "#d84565", // hot rose
  "#e87a5d", // coral
  "#e8a13a", // marigold
  "#e3c47a", // honey
  "#7c9468", // sage
  "#5a8a6e", // emerald
  "#b59bc8", // lavender
  "#6e4475", // plum
  "#e8b4b8", // blush
  "#a83648", // berry
  "#f0a888", // peach
  "#9aa8d4", // periwinkle
  "#d9a5a8", // dusty rose
  "#c47a5d", // terracotta
  "#b8924e", // brass
] as const

function pickWildflowerColor(id: string): string {
  // Cheap stable hash → bucket index. Same id always lands on the same colour.
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return WILDFLOWER_PALETTE[Math.abs(h) % WILDFLOWER_PALETTE.length]
}

function prettyShortDate(iso: string): string {
  try {
    const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10))
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

interface RawProject {
  id?: string
  title?: string
  status?: string
  category?: string
  updatedAt?: number
  milestones?: Array<{ id?: string; text?: string; done?: boolean }>
}
interface RawJournal {
  id?: string
  body?: string
  prompt?: string
  isoDate?: string
  updatedAt?: number
}

/**
 * Build the prioritized list of items that appear as flowers in the garden.
 * Read directly from localStorage so the garden always reflects the rest
 * of the app's truth.
 *
 * Priority order (newest first within each bucket):
 *  1. Completed projects   — biggest, front-most blooms
 *  2. Done milestones      — supportive blooms in the parent project's colour
 *  3. Reflections (any entry with content)
 *  4. Active projects      — sprouts / buds (promises of future blooms)
 *
 * Sliced to the caller — typically capped to the number of flower spots.
 */
export function buildGardenItems(): GardenItem[] {
  if (typeof window === "undefined") return []

  let projects: RawProject[] = []
  try {
    const raw = localStorage.getItem("becoming-projects")
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) projects = parsed
    }
  } catch {
    // ignore
  }

  let journal: RawJournal[] = []
  try {
    const raw = localStorage.getItem("becoming-journal")
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) journal = parsed
    }
  } catch {
    // ignore
  }

  const items: GardenItem[] = []

  // 1. Completed projects — newest first
  const completed = projects
    .filter((p) => p?.status === "completed")
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  for (const p of completed) {
    const cat = CATEGORY_INFO[p.category ?? "other"] ?? CATEGORY_INFO.other
    const id = `complete-${p.id}`
    items.push({
      id,
      type: "complete",
      title: p.title || "A completed thread",
      subtitle: `Complete · ${cat.label}`,
      tint: pickWildflowerColor(id),
      flowerType: 0, // tulip
      scale: 1.0,
    })
  }

  // 2. Done milestones — newest projects' milestones first
  const sortedProjects = [...projects].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  for (const p of sortedProjects) {
    const cat = CATEGORY_INFO[p.category ?? "other"] ?? CATEGORY_INFO.other
    for (const m of p.milestones ?? []) {
      if (!m?.done) continue
      const id = `milestone-${p.id}-${m.id}`
      items.push({
        id,
        type: "milestone",
        title: m.text || "A milestone",
        subtitle: p.title ? `Milestone in ${p.title}` : `In ${cat.label}`,
        tint: pickWildflowerColor(id),
        flowerType: 1, // daisy
        scale: 0.9,
      })
    }
  }

  // 3. Reflections — newest first
  const reflections = [...journal]
    .filter((e) => (e?.body ?? "").trim().length > 0)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  for (const e of reflections) {
    const id = `reflection-${e.id}`
    items.push({
      id,
      type: "reflection",
      title: e.prompt || "A free page",
      subtitle: e.isoDate ? `Reflection · ${prettyShortDate(e.isoDate)}` : "Reflection",
      tint: pickWildflowerColor(id),
      flowerType: 2, // cluster
      scale: 0.9,
    })
  }

  // 4. Active projects — newest first, shown as sprouts.
  // Sprouts KEEP the category tint as the visible "promise" of what
  // they'll become; only the bloomed items go cacophonous.
  const active = projects
    .filter((p) => p?.status === "active")
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  for (const p of active) {
    const cat = CATEGORY_INFO[p.category ?? "other"] ?? CATEGORY_INFO.other
    items.push({
      id: `tending-${p.id}`,
      type: "tending",
      title: p.title || "In progress",
      subtitle: `Tending · ${cat.label}`,
      tint: cat.tint,
      flowerType: 4, // sprout
      scale: 0.75,
    })
  }

  return items
}

export const ITEM_EYEBROW: Record<GardenItemType, string> = {
  complete: "Complete",
  milestone: "Milestone",
  reflection: "Reflection",
  tending: "Tending",
}
