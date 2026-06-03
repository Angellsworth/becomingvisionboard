// Shared shapes used by both the localStorage and Supabase backends.

export interface CollageImage {
  id: string
  url: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
}

export interface AnnualCollageData {
  images: CollageImage[]
  theme: string
}

export interface ReflectionData {
  helped: string
  resisted: string
  adjust: string
}

export interface Practice {
  id: string
  text: string
  isPaused: boolean
  completedDays: string[] // ISO date strings (YYYY-MM-DD)
}

export const DEFAULT_THEME = "Transformation"

export function emptyReflection(): ReflectionData {
  return { helped: "", resisted: "", adjust: "" }
}
