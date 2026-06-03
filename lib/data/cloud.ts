// Supabase backend. Each call requires a Supabase client + the user id.
//
// Schema notes:
// - annual_collages(user_id, year, theme, images jsonb) — unique on (user_id, year)
// - monthly_collages(user_id, year, month integer, direction text, reflection text, images jsonb)
//     unique on (user_id, year, month). reflection is stored as JSON.
// - practices(user_id, year, month, name, is_paused) — one row per practice
// - practice_completions(practice_id, user_id, completed_date) — one row per check
//
// The component-facing API still talks slugs ("january"); we translate to the
// integer columns here.
import type { SupabaseClient } from "@supabase/supabase-js"
import { monthSlugToNumber } from "./months"
import {
  DEFAULT_THEME,
  emptyReflection,
  type AnnualCollageData,
  type CollageImage,
  type Practice,
  type ReflectionData,
} from "./types"

// --- Annual ----------------------------------------------------------------

export async function getAnnualCollage(
  supabase: SupabaseClient,
  userId: string,
  year: number,
): Promise<AnnualCollageData | null> {
  const { data, error } = await supabase
    .from("annual_collages")
    .select("theme, images")
    .eq("user_id", userId)
    .eq("year", year)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    theme: (data.theme as string | null) ?? DEFAULT_THEME,
    images: (data.images as CollageImage[]) ?? [],
  }
}

export async function upsertAnnualCollage(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  data: AnnualCollageData,
): Promise<void> {
  const { error } = await supabase
    .from("annual_collages")
    .upsert(
      { user_id: userId, year, theme: data.theme, images: data.images, updated_at: new Date().toISOString() },
      { onConflict: "user_id,year" },
    )
  if (error) throw error
}

// --- Monthly (collage / direction / reflection share a row) ----------------

interface MonthlyRow {
  direction: string | null
  reflection: string | null // JSON-encoded ReflectionData
  images: CollageImage[] | null
}

async function getMonthlyRow(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
): Promise<MonthlyRow | null> {
  const { data, error } = await supabase
    .from("monthly_collages")
    .select("direction, reflection, images")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", monthSlugToNumber(month))
    .maybeSingle()
  if (error) throw error
  return data as MonthlyRow | null
}

async function upsertMonthlyPartial(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
  patch: Partial<MonthlyRow>,
): Promise<void> {
  const existing = (await getMonthlyRow(supabase, userId, year, month)) ?? {
    direction: null,
    reflection: null,
    images: null,
  }
  const row = {
    user_id: userId,
    year,
    month: monthSlugToNumber(month),
    direction: patch.direction ?? existing.direction,
    reflection: patch.reflection ?? existing.reflection,
    images: patch.images ?? existing.images,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase
    .from("monthly_collages")
    .upsert(row, { onConflict: "user_id,year,month" })
  if (error) throw error
}

export async function getMonthlyCollage(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
): Promise<CollageImage[] | null> {
  const row = await getMonthlyRow(supabase, userId, year, month)
  if (!row) return null
  return row.images ?? []
}

export async function setMonthlyCollage(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
  images: CollageImage[],
): Promise<void> {
  await upsertMonthlyPartial(supabase, userId, year, month, { images })
}

export async function getDirection(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
): Promise<string | null> {
  const row = await getMonthlyRow(supabase, userId, year, month)
  if (!row) return null
  return row.direction ?? ""
}

export async function setDirection(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
  direction: string,
): Promise<void> {
  await upsertMonthlyPartial(supabase, userId, year, month, { direction })
}

export async function getReflection(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
): Promise<ReflectionData | null> {
  const row = await getMonthlyRow(supabase, userId, year, month)
  if (!row) return null
  if (!row.reflection) return emptyReflection()
  try {
    return JSON.parse(row.reflection) as ReflectionData
  } catch {
    return emptyReflection()
  }
}

export async function setReflection(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
  reflection: ReflectionData,
): Promise<void> {
  await upsertMonthlyPartial(supabase, userId, year, month, { reflection: JSON.stringify(reflection) })
}

// --- Practices --------------------------------------------------------------

interface PracticeRow {
  id: string
  name: string
  is_paused: boolean
}
interface CompletionRow {
  practice_id: string
  completed_date: string
}

export async function getPractices(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
): Promise<Practice[] | null> {
  const m = monthSlugToNumber(month)
  const { data: practices, error: pErr } = await supabase
    .from("practices")
    .select("id, name, is_paused")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", m)
  if (pErr) throw pErr
  if (!practices || practices.length === 0) return []

  const ids = (practices as PracticeRow[]).map((p) => p.id)
  const { data: completions, error: cErr } = await supabase
    .from("practice_completions")
    .select("practice_id, completed_date")
    .in("practice_id", ids)
  if (cErr) throw cErr

  const byPractice = new Map<string, string[]>()
  for (const row of (completions ?? []) as CompletionRow[]) {
    const list = byPractice.get(row.practice_id) ?? []
    list.push(row.completed_date)
    byPractice.set(row.practice_id, list)
  }

  return (practices as PracticeRow[]).map((p) => ({
    id: p.id,
    text: p.name,
    isPaused: p.is_paused,
    completedDays: byPractice.get(p.id) ?? [],
  }))
}

/**
 * Replace the user's practices for (year, month) with the given list.
 * Simple strategy: delete existing rows (cascade kills completions), insert new.
 *
 * This trades read efficiency for write simplicity — fine for the small number
 * of practices a user typically tracks.
 */
export async function setPractices(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  month: string,
  practices: Practice[],
): Promise<void> {
  const m = monthSlugToNumber(month)

  // Wipe existing for this user/year/month.
  const { error: delErr } = await supabase
    .from("practices")
    .delete()
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", m)
  if (delErr) throw delErr

  if (practices.length === 0) return

  // Insert fresh practices. Let DB generate UUIDs so they're real Postgres uuids.
  const inserts = practices.map((p) => ({
    user_id: userId,
    year,
    month: m,
    name: p.text,
    is_paused: p.isPaused,
  }))
  const { data: inserted, error: insErr } = await supabase
    .from("practices")
    .insert(inserts)
    .select("id, name")
  if (insErr) throw insErr

  // Map local id → new DB id by row order (we control both arrays).
  const completionInserts: { practice_id: string; user_id: string; completed_date: string }[] = []
  ;(inserted ?? []).forEach((row, i) => {
    for (const day of practices[i].completedDays) {
      completionInserts.push({ practice_id: row.id as string, user_id: userId, completed_date: day })
    }
  })

  if (completionInserts.length > 0) {
    const { error: compErr } = await supabase.from("practice_completions").insert(completionInserts)
    if (compErr) throw compErr
  }
}
