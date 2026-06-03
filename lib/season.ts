// Date helpers for the Home Dashboard.
// Greeting, formatted date, and the user's current life season.

export type Season = "spring" | "summer" | "autumn" | "winter"

export interface SeasonInfo {
  name: Season
  display: string
  // A short editorial line for the season card.
  whisper: string
  // Tailwind color token for the accent.
  color: string
}

const SEASONS: Record<Season, SeasonInfo> = {
  spring: {
    name: "spring",
    display: "Spring",
    whisper: "Soft beginnings. Tender threads.",
    color: "sage",
  },
  summer: {
    name: "summer",
    display: "Summer",
    whisper: "Long light. Open windows.",
    color: "honey",
  },
  autumn: {
    name: "autumn",
    display: "Autumn",
    whisper: "Turning inward. Honest harvest.",
    color: "terracotta",
  },
  winter: {
    name: "winter",
    display: "Winter",
    whisper: "Quiet rooms. Deep listening.",
    color: "dusty-rose",
  },
}

export function currentSeason(date: Date = new Date()): SeasonInfo {
  // Northern Hemisphere meteorological seasons.
  const m = date.getMonth() + 1
  if (m >= 3 && m <= 5) return SEASONS.spring
  if (m >= 6 && m <= 8) return SEASONS.summer
  if (m >= 9 && m <= 11) return SEASONS.autumn
  return SEASONS.winter
}

export function greetingFor(date: Date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return "Hello, night owl"
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  if (h < 21) return "Good evening"
  return "Good night"
}

export function formattedDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function isoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}
