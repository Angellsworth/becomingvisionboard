"use client"

// Single-pattern hooks for every persisted resource.
//
// Behavior:
// - Reads localStorage immediately on mount (sync), so UI is responsive.
// - If signed in, fires a cloud read in the background; cloud wins for non-null.
// - Every save writes localStorage immediately AND debounces a cloud upsert.
// - If not signed in, only localStorage is touched.
//
// Why localStorage stays even when authed: it acts as an offline cache so the
// app loads instantly and survives network blips. Cloud is the source of truth
// across devices; local is best-effort eventual consistency.
import { useCallback, useEffect, useRef, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { useYear } from "@/components/year-provider"
import { local } from "./local"
import * as cloud from "./cloud"
import {
  DEFAULT_THEME,
  emptyReflection,
  type AnnualCollageData,
  type CollageImage,
  type Practice,
  type ReflectionData,
} from "./types"

const SAVE_DEBOUNCE_MS = 600

// Tiny debounce that uses refs so we don't re-create timers each render.
function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  ms: number,
): (...args: T) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fnRef = useRef(fn)
  fnRef.current = fn
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  return useCallback(
    (...args: T) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => fnRef.current(...args), ms)
    },
    [ms],
  )
}

// Returns the same client instance for the component's lifetime.
function useSupabase(): SupabaseClient | null {
  const ref = useRef<SupabaseClient | null | undefined>(undefined)
  if (ref.current === undefined) ref.current = createBrowserClient()
  return ref.current ?? null
}

// --- Annual collage --------------------------------------------------------

export function useAnnualCollage(year: number) {
  const { user } = useAuth()
  const supabase = useSupabase()
  const [data, setData] = useState<AnnualCollageData>({ images: [], theme: DEFAULT_THEME })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(false)
    // 1. local first
    const localData = local.getAnnualCollage(year)
    setData(localData)

    // 2. cloud if authed
    let cancelled = false
    ;(async () => {
      if (user && supabase) {
        try {
          const cloudData = await cloud.getAnnualCollage(supabase, user.id, year)
          if (!cancelled && cloudData) {
            setData(cloudData)
            // mirror cloud to local cache
            local.setAnnualCollage(year, cloudData)
          }
        } catch (e) {
          console.error("[cloud] getAnnualCollage failed", e)
        }
      }
      if (!cancelled) setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [year, user, supabase])

  const cloudSave = useDebouncedCallback(async (next: AnnualCollageData) => {
    if (!user || !supabase) return
    try {
      await cloud.upsertAnnualCollage(supabase, user.id, year, next)
    } catch (e) {
      console.error("[cloud] upsertAnnualCollage failed", e)
    }
  }, SAVE_DEBOUNCE_MS)

  const save = useCallback(
    (next: AnnualCollageData | ((prev: AnnualCollageData) => AnnualCollageData)) => {
      setData((prev) => {
        const value = typeof next === "function" ? (next as (p: AnnualCollageData) => AnnualCollageData)(prev) : next
        local.setAnnualCollage(year, value)
        cloudSave(value)
        return value
      })
    },
    [year, cloudSave],
  )

  return { data, save, hydrated }
}

// --- Monthly collage -------------------------------------------------------

export function useMonthlyCollageData(month: string) {
  const { year } = useYear()
  const { user } = useAuth()
  const supabase = useSupabase()
  const [images, setImagesState] = useState<CollageImage[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(false)
    setImagesState(local.getMonthlyCollage(month, year))
    let cancelled = false
    ;(async () => {
      if (user && supabase) {
        try {
          const cloudImgs = await cloud.getMonthlyCollage(supabase, user.id, year, month)
          if (!cancelled && cloudImgs !== null) {
            setImagesState(cloudImgs)
            local.setMonthlyCollage(month, year, cloudImgs)
          }
        } catch (e) {
          console.error("[cloud] getMonthlyCollage failed", e)
        }
      }
      if (!cancelled) setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [month, year, user, supabase])

  const cloudSave = useDebouncedCallback(async (next: CollageImage[]) => {
    if (!user || !supabase) return
    try {
      await cloud.setMonthlyCollage(supabase, user.id, year, month, next)
    } catch (e) {
      console.error("[cloud] setMonthlyCollage failed", e)
    }
  }, SAVE_DEBOUNCE_MS)

  const setImages = useCallback(
    (next: CollageImage[] | ((prev: CollageImage[]) => CollageImage[])) => {
      setImagesState((prev) => {
        const value = typeof next === "function" ? (next as (p: CollageImage[]) => CollageImage[])(prev) : next
        local.setMonthlyCollage(month, year, value)
        cloudSave(value)
        return value
      })
    },
    [month, year, cloudSave],
  )

  return { images, setImages, hydrated }
}

// --- Direction -------------------------------------------------------------

export function useDirection(month: string) {
  const { year } = useYear()
  const { user } = useAuth()
  const supabase = useSupabase()
  const [direction, setDirectionState] = useState("")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(false)
    setDirectionState(local.getDirection(month, year))
    let cancelled = false
    ;(async () => {
      if (user && supabase) {
        try {
          const value = await cloud.getDirection(supabase, user.id, year, month)
          if (!cancelled && value !== null) {
            setDirectionState(value)
            local.setDirection(month, year, value)
          }
        } catch (e) {
          console.error("[cloud] getDirection failed", e)
        }
      }
      if (!cancelled) setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [month, year, user, supabase])

  const cloudSave = useDebouncedCallback(async (next: string) => {
    if (!user || !supabase) return
    try {
      await cloud.setDirection(supabase, user.id, year, month, next)
    } catch (e) {
      console.error("[cloud] setDirection failed", e)
    }
  }, SAVE_DEBOUNCE_MS)

  const setDirection = useCallback(
    (next: string) => {
      setDirectionState(next)
      local.setDirection(month, year, next)
      cloudSave(next)
    },
    [month, year, cloudSave],
  )

  return { direction, setDirection, hydrated }
}

// --- Reflection ------------------------------------------------------------

export function useReflection(month: string) {
  const { year } = useYear()
  const { user } = useAuth()
  const supabase = useSupabase()
  const [reflection, setReflectionState] = useState<ReflectionData>(emptyReflection())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(false)
    setReflectionState(local.getReflection(month, year))
    let cancelled = false
    ;(async () => {
      if (user && supabase) {
        try {
          const value = await cloud.getReflection(supabase, user.id, year, month)
          if (!cancelled && value !== null) {
            setReflectionState(value)
            local.setReflection(month, year, value)
          }
        } catch (e) {
          console.error("[cloud] getReflection failed", e)
        }
      }
      if (!cancelled) setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [month, year, user, supabase])

  const cloudSave = useDebouncedCallback(async (next: ReflectionData) => {
    if (!user || !supabase) return
    try {
      await cloud.setReflection(supabase, user.id, year, month, next)
    } catch (e) {
      console.error("[cloud] setReflection failed", e)
    }
  }, SAVE_DEBOUNCE_MS)

  const setReflection = useCallback(
    (next: ReflectionData | ((prev: ReflectionData) => ReflectionData)) => {
      setReflectionState((prev) => {
        const value = typeof next === "function" ? (next as (p: ReflectionData) => ReflectionData)(prev) : next
        local.setReflection(month, year, value)
        cloudSave(value)
        return value
      })
    },
    [month, year, cloudSave],
  )

  return { reflection, setReflection, hydrated }
}

// --- Practices -------------------------------------------------------------

export function usePractices(month: string) {
  const { year } = useYear()
  const { user } = useAuth()
  const supabase = useSupabase()
  const [practices, setPracticesState] = useState<Practice[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(false)
    setPracticesState(local.getPractices(month, year))
    let cancelled = false
    ;(async () => {
      if (user && supabase) {
        try {
          const value = await cloud.getPractices(supabase, user.id, year, month)
          if (!cancelled && value !== null) {
            setPracticesState(value)
            local.setPractices(month, year, value)
          }
        } catch (e) {
          console.error("[cloud] getPractices failed", e)
        }
      }
      if (!cancelled) setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [month, year, user, supabase])

  const cloudSave = useDebouncedCallback(async (next: Practice[]) => {
    if (!user || !supabase) return
    try {
      await cloud.setPractices(supabase, user.id, year, month, next)
    } catch (e) {
      console.error("[cloud] setPractices failed", e)
    }
  }, SAVE_DEBOUNCE_MS)

  const setPractices = useCallback(
    (next: Practice[] | ((prev: Practice[]) => Practice[])) => {
      setPracticesState((prev) => {
        const value = typeof next === "function" ? (next as (p: Practice[]) => Practice[])(prev) : next
        local.setPractices(month, year, value)
        cloudSave(value)
        return value
      })
    },
    [month, year, cloudSave],
  )

  return { practices, setPractices, hydrated }
}
