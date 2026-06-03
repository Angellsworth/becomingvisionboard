"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { getCurrentYear, keys, migrateLegacyKeys } from "@/lib/year"

interface YearContextValue {
  /** The year the user is currently viewing. */
  year: number
  /** Today's actual calendar year — never changes. */
  currentYear: number
  /** Change the viewed year (persisted to localStorage). */
  setYear: (year: number) => void
  /** True once the provider has read from localStorage. Prevents SSR/CSR hydration mismatch. */
  ready: boolean
}

const YearContext = createContext<YearContextValue | undefined>(undefined)

interface YearProviderProps {
  children: React.ReactNode
}

export function YearProvider({ children }: YearProviderProps) {
  const currentYear = getCurrentYear()
  const [year, setYearState] = useState<number>(currentYear)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Migrate any legacy un-suffixed keys into the 2026 bucket first.
    migrateLegacyKeys()

    // Restore the last viewed year, if any. Default to current year.
    try {
      const saved = localStorage.getItem(keys.selectedYear)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= currentYear + 1) {
          setYearState(parsed)
        }
      }
    } catch {
      // ignore
    }
    setReady(true)
  }, [currentYear])

  const setYear = useCallback((next: number) => {
    setYearState(next)
    try {
      localStorage.setItem(keys.selectedYear, String(next))
    } catch {
      // ignore
    }
  }, [])

  return (
    <YearContext.Provider value={{ year, currentYear, setYear, ready }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear(): YearContextValue {
  const ctx = useContext(YearContext)
  if (!ctx) {
    // Safety fallback so a component used outside the provider doesn't crash.
    const currentYear = getCurrentYear()
    return {
      year: currentYear,
      currentYear,
      setYear: () => {},
      ready: true,
    }
  }
  return ctx
}
