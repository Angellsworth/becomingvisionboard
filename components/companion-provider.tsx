"use client"

import { createContext, useCallback, useContext, useState } from "react"

interface CompanionContextValue {
  open: boolean
  setOpen: (next: boolean) => void
  toggle: () => void
}

const Ctx = createContext<CompanionContextValue | undefined>(undefined)

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(false)
  const setOpen = useCallback((next: boolean) => setOpenState(next), [])
  const toggle = useCallback(() => setOpenState((v) => !v), [])
  return <Ctx.Provider value={{ open, setOpen, toggle }}>{children}</Ctx.Provider>
}

export function useCompanion(): CompanionContextValue {
  const v = useContext(Ctx)
  if (!v) return { open: false, setOpen: () => {}, toggle: () => {} }
  return v
}
