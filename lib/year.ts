// Year helpers + year-namespaced localStorage key builders.
// Single source of truth so the app rolls forward automatically each year.

export const LEGACY_YEAR = 2026 // year when un-suffixed keys were created

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

// Storage key builders — keep these in one place so renames are safe.
export const keys = {
  annualCollage: (year: number) => `collage-annual-${year}`,
  annualTheme: (year: number) => `annual-theme-${year}`,
  monthlyCollage: (month: string, year: number) => `collage-${month}-${year}`,
  direction: (month: string, year: number) => `direction-${month}-${year}`,
  practices: (month: string, year: number) => `practices-${month}-${year}`,
  reflection: (month: string, year: number) => `reflection-${month}-${year}`,
  selectedYear: "selected-year",
  migrationDone: "year-migration-v1-done",
}

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

// Move legacy un-suffixed keys into the 2026 bucket on first load so existing
// users don't lose data when storage keys become year-scoped. Idempotent.
export function migrateLegacyKeys(): void {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(keys.migrationDone)) return

    // Annual collage: the previous version used "collage-annual-2026" /
    // "annual-theme-2026" already, so no rename needed for those. Just mark
    // migration complete for monthly keys.
    for (const m of MONTHS) {
      const oldCollage = localStorage.getItem(`collage-${m}`)
      if (oldCollage && !localStorage.getItem(keys.monthlyCollage(m, LEGACY_YEAR))) {
        localStorage.setItem(keys.monthlyCollage(m, LEGACY_YEAR), oldCollage)
        localStorage.removeItem(`collage-${m}`)
      }
      const oldDirection = localStorage.getItem(`direction-${m}`)
      if (oldDirection !== null && !localStorage.getItem(keys.direction(m, LEGACY_YEAR))) {
        localStorage.setItem(keys.direction(m, LEGACY_YEAR), oldDirection)
        localStorage.removeItem(`direction-${m}`)
      }
      const oldPractices = localStorage.getItem(`practices-${m}`)
      if (oldPractices && !localStorage.getItem(keys.practices(m, LEGACY_YEAR))) {
        localStorage.setItem(keys.practices(m, LEGACY_YEAR), oldPractices)
        localStorage.removeItem(`practices-${m}`)
      }
      const oldReflection = localStorage.getItem(`reflection-${m}`)
      if (oldReflection && !localStorage.getItem(keys.reflection(m, LEGACY_YEAR))) {
        localStorage.setItem(keys.reflection(m, LEGACY_YEAR), oldReflection)
        localStorage.removeItem(`reflection-${m}`)
      }
    }

    localStorage.setItem(keys.migrationDone, "1")
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

// Discover years that have any saved data. Used to bound the year selector.
export function discoverYearsWithData(): number[] {
  if (typeof window === "undefined") return [getCurrentYear()]
  const years = new Set<number>()
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      const match = key.match(/-(\d{4})$/)
      if (match) years.add(parseInt(match[1], 10))
    }
  } catch {
    // ignore
  }
  years.add(getCurrentYear())
  return Array.from(years).sort((a, b) => a - b)
}
