"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client"
import { migrateLocalToCloud } from "@/lib/data/migration"

interface AuthContextValue {
  /** The signed-in user, or null. Always null when Supabase isn't configured. */
  user: User | null
  /** True until the first auth check completes. */
  loading: boolean
  /** True if Supabase env vars are set. */
  authEnabled: boolean
  /** Sign out and redirect to "/". */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authEnabled = hasSupabaseEnv()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(authEnabled) // skip loading state if auth is off

  useEffect(() => {
    if (!authEnabled) {
      setLoading(false)
      return
    }
    const supabase = createBrowserClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
      if (user) void migrateLocalToCloud(supabase, user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) void migrateLocalToCloud(supabase, nextUser.id)
    })

    return () => subscription.unsubscribe()
  }, [authEnabled])

  const signOut = useCallback(async () => {
    const supabase = createBrowserClient()
    if (supabase) await supabase.auth.signOut()
    window.location.href = "/"
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, authEnabled, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    // Safety: never crash if a component renders outside the provider.
    return { user: null, loading: false, authEnabled: false, signOut: async () => {} }
  }
  return ctx
}
