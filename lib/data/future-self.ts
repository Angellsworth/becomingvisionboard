// Future Self — a profile of the woman you are becoming.
//
// Year-agnostic (the woman you're becoming is a lifetime arc, not
// a calendar slice). Single localStorage object. Cloud sync to
// Supabase follows in its own pass.

import { useCallback, useEffect, useState } from "react"

export interface FutureSelfProfile {
  /** The headline manifesto — long-form, written in first person. */
  visionStatement: string
  /** Chip set: values she lives by. */
  values: string[]
  /** Chip set: qualities she's cultivating. */
  traits: string[]
  /** Ordered list: rituals and rhythms that shape her days. */
  routines: string[]
  /** Ordered list: goals tied gently to seasons. */
  goals: string[]
  /** Free-form: how she dresses, the way her home feels, the way she moves. */
  personalStyle: string
  /** A quote, song, mantra — the thing she returns to. */
  anchor: string
}

const STORAGE_KEY = "becoming-future-self"

export const EMPTY_PROFILE: FutureSelfProfile = {
  visionStatement: "",
  values: [],
  traits: [],
  routines: [],
  goals: [],
  personalStyle: "",
  anchor: "",
}

function safeRead(): FutureSelfProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PROFILE
    const parsed = JSON.parse(raw) as Partial<FutureSelfProfile>
    // Be defensive — fields may have been added since the user last saved.
    return {
      ...EMPTY_PROFILE,
      ...parsed,
      values: Array.isArray(parsed?.values) ? parsed.values : [],
      traits: Array.isArray(parsed?.traits) ? parsed.traits : [],
      routines: Array.isArray(parsed?.routines) ? parsed.routines : [],
      goals: Array.isArray(parsed?.goals) ? parsed.goals : [],
    }
  } catch {
    return EMPTY_PROFILE
  }
}

function safeWrite(profile: FutureSelfProfile): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // ignore quota
  }
}

/**
 * Hook for editing the Future Self profile. Reads on mount, writes
 * on every mutation. Returns granular setters so individual fields
 * can be updated without rewriting the whole object in the caller.
 */
export function useFutureSelf() {
  const [profile, setProfileState] = useState<FutureSelfProfile>(EMPTY_PROFILE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProfileState(safeRead())
    setHydrated(true)
  }, [])

  const setProfile = useCallback(
    (next: FutureSelfProfile | ((prev: FutureSelfProfile) => FutureSelfProfile)) => {
      setProfileState((prev) => {
        const value = typeof next === "function" ? (next as (p: FutureSelfProfile) => FutureSelfProfile)(prev) : next
        safeWrite(value)
        return value
      })
    },
    [],
  )

  const setField = useCallback(
    <K extends keyof FutureSelfProfile>(key: K, value: FutureSelfProfile[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }))
    },
    [setProfile],
  )

  return { profile, hydrated, setProfile, setField }
}
