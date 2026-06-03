// Mapping between URL slug ("january") and DB integer (1).

export const MONTH_SLUGS = [
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
] as const

export type MonthSlug = (typeof MONTH_SLUGS)[number]

export function monthSlugToNumber(slug: string): number {
  const idx = MONTH_SLUGS.indexOf(slug as MonthSlug)
  if (idx < 0) throw new Error(`Unknown month slug: ${slug}`)
  return idx + 1
}

export function monthNumberToSlug(n: number): MonthSlug {
  if (n < 1 || n > 12) throw new Error(`Month number out of range: ${n}`)
  return MONTH_SLUGS[n - 1]
}
