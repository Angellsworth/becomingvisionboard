"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { DEFAULT_PALETTE, PALETTE_STORAGE_KEY, paletteById, type PaletteId } from "@/lib/palettes"

interface PaletteContextValue {
  palette: PaletteId
  setPalette: (id: PaletteId) => void
}

const PaletteContext = createContext<PaletteContextValue | undefined>(undefined)

const ALL_PALETTE_CLASSES = ["palette-peony", "palette-sage-garden", "palette-coral-bloom", "palette-twilight"]

function applyPaletteClass(palette: PaletteId) {
  if (typeof document === "undefined") return
  const html = document.documentElement
  ALL_PALETTE_CLASSES.forEach((cls) => html.classList.remove(cls))
  html.classList.add(`palette-${palette}`)
}

interface PaletteProviderProps {
  children: React.ReactNode
}

export function PaletteProvider({ children }: PaletteProviderProps) {
  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE)

  // Hydrate from localStorage on mount and apply the class.
  useEffect(() => {
    let saved: PaletteId = DEFAULT_PALETTE
    try {
      const raw = localStorage.getItem(PALETTE_STORAGE_KEY)
      if (raw) saved = paletteById(raw).id
    } catch {
      // ignore
    }
    setPaletteState(saved)
    applyPaletteClass(saved)
  }, [])

  const setPalette = useCallback((id: PaletteId) => {
    setPaletteState(id)
    applyPaletteClass(id)
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, id)
    } catch {
      // ignore
    }
  }, [])

  return <PaletteContext.Provider value={{ palette, setPalette }}>{children}</PaletteContext.Provider>
}

export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext)
  if (!ctx) {
    return { palette: DEFAULT_PALETTE, setPalette: () => {} }
  }
  return ctx
}
