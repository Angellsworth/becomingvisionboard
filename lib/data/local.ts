// localStorage backend. Pure functions, no React.
import { keys } from "@/lib/year"
import {
  DEFAULT_THEME,
  emptyReflection,
  type AnnualCollageData,
  type CollageImage,
  type Practice,
  type ReflectionData,
} from "./types"

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const local = {
  getAnnualCollage(year: number): AnnualCollageData {
    if (typeof window === "undefined") return { images: [], theme: DEFAULT_THEME }
    const images = safeParse<CollageImage[]>(localStorage.getItem(keys.annualCollage(year)), [])
    const theme = localStorage.getItem(keys.annualTheme(year)) ?? DEFAULT_THEME
    return { images, theme }
  },
  setAnnualCollage(year: number, data: AnnualCollageData): void {
    if (typeof window === "undefined") return
    localStorage.setItem(keys.annualCollage(year), JSON.stringify(data.images))
    localStorage.setItem(keys.annualTheme(year), data.theme)
  },

  getMonthlyCollage(month: string, year: number): CollageImage[] {
    if (typeof window === "undefined") return []
    return safeParse<CollageImage[]>(localStorage.getItem(keys.monthlyCollage(month, year)), [])
  },
  setMonthlyCollage(month: string, year: number, images: CollageImage[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(keys.monthlyCollage(month, year), JSON.stringify(images))
  },

  getDirection(month: string, year: number): string {
    if (typeof window === "undefined") return ""
    return localStorage.getItem(keys.direction(month, year)) ?? ""
  },
  setDirection(month: string, year: number, direction: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(keys.direction(month, year), direction)
  },

  getReflection(month: string, year: number): ReflectionData {
    if (typeof window === "undefined") return emptyReflection()
    return safeParse<ReflectionData>(localStorage.getItem(keys.reflection(month, year)), emptyReflection())
  },
  setReflection(month: string, year: number, reflection: ReflectionData): void {
    if (typeof window === "undefined") return
    localStorage.setItem(keys.reflection(month, year), JSON.stringify(reflection))
  },

  getPractices(month: string, year: number): Practice[] {
    if (typeof window === "undefined") return []
    return safeParse<Practice[]>(localStorage.getItem(keys.practices(month, year)), [])
  },
  setPractices(month: string, year: number, practices: Practice[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(keys.practices(month, year), JSON.stringify(practices))
  },
}
