// Reads the user's Becoming context from localStorage to send with each
// chat message so the companion knows what she's tending.
//
// All client-side; we never read localStorage on the server. The shape
// that ends up in the request body is deliberately small — short
// strings, capped arrays — so the system prompt stays compact and the
// model doesn't get confused by irrelevant detail.

export interface CompanionContext {
  futureSelf: {
    visionStatement: string
    values: string[]
    traits: string[]
    routines: string[]
    goals: string[]
    personalStyle: string
    anchor: string
  } | null
  recentPins: Array<{ caption: string; link?: string }>
  displayName: string | null
}

const MAX_PIN_CAPTIONS = 8

export function readCompanionContext(): CompanionContext {
  if (typeof window === "undefined") {
    return { futureSelf: null, recentPins: [], displayName: null }
  }

  // Future Self
  let futureSelf: CompanionContext["futureSelf"] = null
  try {
    const raw = localStorage.getItem("becoming-future-self")
    if (raw) {
      const p = JSON.parse(raw)
      futureSelf = {
        visionStatement: (p?.visionStatement ?? "").trim(),
        values: Array.isArray(p?.values) ? p.values.slice(0, 12) : [],
        traits: Array.isArray(p?.traits) ? p.traits.slice(0, 12) : [],
        routines: Array.isArray(p?.routines) ? p.routines.slice(0, 10) : [],
        goals: Array.isArray(p?.goals) ? p.goals.slice(0, 10) : [],
        personalStyle: (p?.personalStyle ?? "").trim(),
        anchor: (p?.anchor ?? "").trim(),
      }
    }
  } catch {
    // ignore
  }

  // Becoming Board — only the captions, no image data
  let recentPins: CompanionContext["recentPins"] = []
  try {
    const raw = localStorage.getItem("becoming-board-items")
    if (raw) {
      const arr = JSON.parse(raw) as Array<{ caption?: string; link?: string }>
      if (Array.isArray(arr)) {
        recentPins = arr
          .filter((p) => (p?.caption ?? "").trim().length > 0)
          .slice(0, MAX_PIN_CAPTIONS)
          .map((p) => ({
            caption: (p.caption ?? "").trim(),
            link: p.link?.trim() || undefined,
          }))
      }
    }
  } catch {
    // ignore
  }

  // Display name from the profile
  let displayName: string | null = null
  try {
    displayName = localStorage.getItem("becoming-display-name")?.trim() || null
  } catch {
    // ignore
  }

  return { futureSelf, recentPins, displayName }
}
