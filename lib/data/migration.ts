// One-shot localStorage → Supabase migration that runs the first time a user
// signs in on a given device.
//
// Policy ("first login: local wins; after that: cloud wins"):
// - Find every (year, month) tuple represented in localStorage.
// - Upsert into Supabase with onConflict + ignoreDuplicates so we never
//   overwrite anything already in the cloud — local data only fills empty rows.
// - Mark this user as migrated on this device so we never run again here.
//
// The marker is per-user so two people sharing a browser each get their own
// fresh migration.
import type { SupabaseClient } from "@supabase/supabase-js"
import { local } from "./local"
import { monthSlugToNumber, MONTH_SLUGS } from "./months"
import type { CollageImage, Practice } from "./types"
import { DEFAULT_THEME } from "./types"

const MARKER = (userId: string) => `migrated-to-cloud-${userId}`

function discoverYearsInLocal(): number[] {
  const years = new Set<number>()
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      const m = key.match(/-(\d{4})$/)
      if (m) years.add(parseInt(m[1], 10))
    }
  } catch {
    // ignore
  }
  return Array.from(years)
}

export async function migrateLocalToCloud(supabase: SupabaseClient, userId: string): Promise<void> {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(MARKER(userId))) return // already migrated for this user
  } catch {
    return
  }

  const years = discoverYearsInLocal()
  if (years.length === 0) {
    try {
      localStorage.setItem(MARKER(userId), "1")
    } catch {
      // ignore
    }
    return
  }

  try {
    // Annual collages
    const annualUpserts: { user_id: string; year: number; theme: string; images: CollageImage[] }[] = []
    for (const year of years) {
      const a = local.getAnnualCollage(year)
      if (a.images.length > 0 || (a.theme && a.theme !== DEFAULT_THEME)) {
        annualUpserts.push({ user_id: userId, year, theme: a.theme, images: a.images })
      }
    }
    if (annualUpserts.length > 0) {
      await supabase
        .from("annual_collages")
        .upsert(annualUpserts, { onConflict: "user_id,year", ignoreDuplicates: true })
    }

    // Monthly (collage + direction + reflection in one table)
    const monthlyUpserts: {
      user_id: string
      year: number
      month: number
      direction: string | null
      reflection: string | null
      images: CollageImage[] | null
    }[] = []
    for (const year of years) {
      for (const slug of MONTH_SLUGS) {
        const images = local.getMonthlyCollage(slug, year)
        const direction = local.getDirection(slug, year)
        const reflection = local.getReflection(slug, year)
        const hasReflection = reflection.helped || reflection.resisted || reflection.adjust
        if (images.length === 0 && !direction && !hasReflection) continue
        monthlyUpserts.push({
          user_id: userId,
          year,
          month: monthSlugToNumber(slug),
          direction: direction || null,
          reflection: hasReflection ? JSON.stringify(reflection) : null,
          images: images.length > 0 ? images : null,
        })
      }
    }
    if (monthlyUpserts.length > 0) {
      await supabase
        .from("monthly_collages")
        .upsert(monthlyUpserts, { onConflict: "user_id,year,month", ignoreDuplicates: true })
    }

    // Practices — these can't use ignoreDuplicates easily (one row per practice),
    // so we only insert practices for (year, month) tuples that have no rows
    // in the cloud yet.
    for (const year of years) {
      for (const slug of MONTH_SLUGS) {
        const localPractices = local.getPractices(slug, year)
        if (localPractices.length === 0) continue
        const monthNum = monthSlugToNumber(slug)
        const { count } = await supabase
          .from("practices")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("year", year)
          .eq("month", monthNum)
        if ((count ?? 0) > 0) continue // cloud already has practices for this month, don't overwrite

        const inserts = localPractices.map((p: Practice) => ({
          user_id: userId,
          year,
          month: monthNum,
          name: p.text,
          is_paused: p.isPaused,
        }))
        const { data: inserted } = await supabase
          .from("practices")
          .insert(inserts)
          .select("id")
        const completionInserts: { practice_id: string; user_id: string; completed_date: string }[] = []
        ;(inserted ?? []).forEach((row, i) => {
          for (const day of localPractices[i].completedDays) {
            completionInserts.push({ practice_id: row.id as string, user_id: userId, completed_date: day })
          }
        })
        if (completionInserts.length > 0) {
          await supabase.from("practice_completions").insert(completionInserts)
        }
      }
    }

    localStorage.setItem(MARKER(userId), "1")
  } catch (e) {
    console.error("[migration] localStorage → cloud failed", e)
    // Don't mark as migrated; we'll retry next sign-in.
  }
}
