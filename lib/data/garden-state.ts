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
export const PHASES: GardenPhase[] = [
  { min: 0, name: "Quiet", whisper: "A plot of ground. Just beginning." },
  { min: 2, name: "Stirring", whisper: "Something is starting to root." },
  { min: 6, name: "Sprouting", whisper: "Small green things, breathing." },
  { min: 12, name: "Blooming", whisper: "Tending becomes you." },
  { min: 22, name: "Tended", whisper: "The bees know your name." },
  { min: 38, name: "Sanctuary", whisper: "A whole garden of you." },
]

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
