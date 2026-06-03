// Life Projects — the threads of your life held side by side.
// Each project has a title, optional description, category, status,
// a felt progress value, and an optional set of textual milestones.
//
// Progress is *manually* set rather than auto-computed from
// milestones — this matches the "watercolor not productivity app"
// brief. Milestones are little marks of achievement that live
// alongside the bar, not driving it.

import { useCallback, useEffect, useState } from "react"

export type ProjectCategory =
  | "fitness"
  | "home"
  | "career"
  | "travel"
  | "financial"
  | "creative"
  | "wellness"
  | "relationships"
  | "other"

export type ProjectStatus = "active" | "paused" | "completed"

export interface Milestone {
  id: string
  text: string
  done: boolean
}

export interface LifeProject {
  id: string
  title: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  /** 0–100. Manually adjusted via slider, not auto-computed. */
  progress: number
  milestones: Milestone[]
  createdAt: number
  updatedAt: number
}

export interface CategoryInfo {
  id: ProjectCategory
  label: string
  /** Fixed hex used for the progress bar gradient. Doesn't shift between palettes. */
  tint: string
  whisper: string
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "fitness", label: "Fitness", tint: "#7c9468", whisper: "Body in motion" },
  { id: "wellness", label: "Wellness", tint: "#95a87a", whisper: "Inner weather" },
  { id: "home", label: "Home", tint: "#c47a5d", whisper: "The shape of where you live" },
  { id: "career", label: "Career", tint: "#b8924e", whisper: "The work in the world" },
  { id: "creative", label: "Creative", tint: "#92374d", whisper: "What you are making" },
  { id: "travel", label: "Travel", tint: "#d9a5a8", whisper: "Places you are calling in" },
  { id: "financial", label: "Money", tint: "#e3c47a", whisper: "Roots and reserves" },
  { id: "relationships", label: "People", tint: "#e8b4b8", whisper: "Those you tend" },
  { id: "other", label: "Other", tint: "#b5b89c", whisper: "Everything else" },
]

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Complete",
}

export function categoryInfo(id: ProjectCategory): CategoryInfo {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}

const STORAGE_KEY = "becoming-projects"

function read(): LifeProject[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LifeProject[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: LifeProject[]): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch (e) {
    console.warn("[projects] write failed", e)
    return false
  }
}

const STATUS_ORDER: Record<ProjectStatus, number> = {
  active: 0,
  paused: 1,
  completed: 2,
}

/** Sort: active first → paused → completed; ties broken by recency. */
function sortProjects(items: LifeProject[]): LifeProject[] {
  return [...items].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (s !== 0) return s
    return b.updatedAt - a.updatedAt
  })
}

export const projectsStore = {
  list(): LifeProject[] {
    return sortProjects(read())
  },
  add(partial: Omit<LifeProject, "id" | "createdAt" | "updatedAt">): LifeProject | null {
    const now = Date.now()
    const item: LifeProject = {
      ...partial,
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    }
    if (!write([item, ...read()])) return null
    return item
  },
  update(id: string, patch: Partial<Omit<LifeProject, "id" | "createdAt">>): LifeProject | null {
    const items = read()
    const idx = items.findIndex((p) => p.id === id)
    if (idx === -1) return null
    const updated: LifeProject = { ...items[idx], ...patch, id, updatedAt: Date.now() }
    items[idx] = updated
    if (!write(items)) return null
    return updated
  },
  remove(id: string): void {
    write(read().filter((p) => p.id !== id))
  },
}

/** React hook over the store. */
export function useProjects() {
  const [items, setItems] = useState<LifeProject[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(projectsStore.list())
    setHydrated(true)
  }, [])

  const refresh = useCallback(() => setItems(projectsStore.list()), [])

  const add = useCallback(
    (partial: Omit<LifeProject, "id" | "createdAt" | "updatedAt">) => {
      const result = projectsStore.add(partial)
      if (result) refresh()
      return result
    },
    [refresh],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<LifeProject, "id" | "createdAt">>) => {
      const result = projectsStore.update(id, patch)
      if (result) refresh()
      return result
    },
    [refresh],
  )

  const remove = useCallback(
    (id: string) => {
      projectsStore.remove(id)
      refresh()
    },
    [refresh],
  )

  const toggleMilestone = useCallback(
    (projectId: string, milestoneId: string) => {
      const project = projectsStore.list().find((p) => p.id === projectId)
      if (!project) return
      const nextMilestones = project.milestones.map((m) =>
        m.id === milestoneId ? { ...m, done: !m.done } : m,
      )
      projectsStore.update(projectId, { milestones: nextMilestones })
      refresh()
    },
    [refresh],
  )

  return { items, hydrated, add, update, remove, toggleMilestone }
}

export function makeMilestone(text: string): Milestone {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    done: false,
  }
}
