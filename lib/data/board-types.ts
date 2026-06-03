// Becoming Board — shapes used by the Pinterest-style board.
//
// Items are year-agnostic (the board is a lifetime canvas), so no
// year scoping. Cloud sync to Supabase will come in a follow-up;
// for now the only backend is localStorage.

export type PinSize = "small" | "medium" | "large"

export interface BoardItem {
  id: string
  /** Data URL or hosted URL for the image. */
  imageUrl: string
  caption: string
  /** Optional outbound link the user attaches to the pin. */
  link: string
  /** Size key controls the aspect ratio in the masonry. */
  size: PinSize
  /** CSS rotate in degrees, mostly small values (-12 to 12). */
  rotation: number
  /** Higher = newer, used for sort order. */
  createdAt: number
  updatedAt: number
}

export const DEFAULT_SIZE: PinSize = "medium"

/** Aspect-ratio mapping for the masonry pin card. */
export const SIZE_ASPECT: Record<PinSize, string> = {
  small: "aspect-[4/3]",
  medium: "aspect-[3/4]",
  large: "aspect-[2/3]",
}

export const SIZE_LABEL: Record<PinSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Tall",
}
