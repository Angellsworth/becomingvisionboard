// Palette catalog. Each palette has a name, a poetic description,
// and a set of swatches to render in the picker UI.
// The actual CSS lives in app/globals.css under `.palette-{id}` classes.

export type PaletteId = "peony" | "sage-garden" | "coral-bloom" | "twilight"

export interface PaletteInfo {
  id: PaletteId
  name: string
  whisper: string
  // Hex swatches shown in the picker — light-mode primary/secondary/accent/bg in order.
  swatches: string[]
}

export const PALETTES: PaletteInfo[] = [
  {
    id: "peony",
    name: "Peony",
    whisper: "Soft florals, marigold mornings, sage in the windows.",
    swatches: ["#d9617c", "#e8b34f", "#95a87a", "#fcf5ec"],
  },
  {
    id: "sage-garden",
    name: "Sage Garden",
    whisper: "Fresh herbs, dusty rose, pale honey light.",
    swatches: ["#7c9468", "#d9a5a8", "#e8b34f", "#f3f1e8"],
  },
  {
    id: "coral-bloom",
    name: "Coral Bloom",
    whisper: "Warm coral, cinnamon, golden hour all day.",
    swatches: ["#d96a4a", "#e8b34f", "#c89a6a", "#fcefe5"],
  },
  {
    id: "twilight",
    name: "Twilight Velvet",
    whisper: "Anthropologie at dusk — aubergine, brass, rose.",
    swatches: ["#b8924e", "#d9a5a8", "#b5b89c", "#faf6ed"],
  },
]

export const DEFAULT_PALETTE: PaletteId = "peony"

export function paletteById(id: string | null | undefined): PaletteInfo {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}

export const PALETTE_STORAGE_KEY = "becoming-palette"
