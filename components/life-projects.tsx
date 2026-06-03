"use client"

import { useCallback, useMemo, useState } from "react"
import { Plus, Target } from "lucide-react"
import { ProjectCard } from "@/components/project-card"
import { ProjectEditor } from "@/components/project-editor"
import {
  CATEGORIES,
  useProjects,
  type LifeProject,
  type Milestone,
  type ProjectCategory,
  type ProjectStatus,
} from "@/lib/data/projects"
import { cn } from "@/lib/utils"

type Filter = "all" | ProjectCategory | "active" | "completed"

export function LifeProjects() {
  const { items, hydrated, add, update, remove, toggleMilestone } = useProjects()
  const [filter, setFilter] = useState<Filter>("all")
  // undefined = closed, null = new, LifeProject = editing
  const [editorState, setEditorState] = useState<LifeProject | null | undefined>(undefined)

  const openNew = useCallback(() => setEditorState(null), [])
  const openEdit = useCallback((p: LifeProject) => setEditorState(p), [])
  const closeEditor = useCallback(() => setEditorState(undefined), [])

  const handleSave = useCallback(
    (draft: {
      title: string
      description: string
      category: ProjectCategory
      status: ProjectStatus
      progress: number
      milestones: Milestone[]
    }) => {
      if (editorState === null) {
        add(draft)
      } else if (editorState) {
        update(editorState.id, draft)
      }
      closeEditor()
    },
    [editorState, add, update, closeEditor],
  )

  const handleDelete = useCallback(() => {
    if (!editorState) return
    remove(editorState.id)
    closeEditor()
  }, [editorState, remove, closeEditor])

  const filtered = useMemo(() => {
    if (filter === "all") return items
    if (filter === "active") return items.filter((p) => p.status === "active")
    if (filter === "completed") return items.filter((p) => p.status === "completed")
    return items.filter((p) => p.category === filter)
  }, [items, filter])

  // Distinct categories that actually have projects, for the filter chips
  const usedCategories = useMemo(() => {
    const set = new Set<ProjectCategory>()
    items.forEach((p) => set.add(p.category))
    return CATEGORIES.filter((c) => set.has(c.id))
  }, [items])

  const empty = hydrated && items.length === 0
  const noMatches = hydrated && items.length > 0 && filtered.length === 0

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-24 md:pb-16">
      {/* ─── Header ─── */}
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-mark" aria-hidden />
            <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-primary">
              Life Projects
            </p>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-[0.04em] leading-[1.02] text-foreground">
            Threads in motion
          </h1>
          <p className="mt-3 font-serif italic text-base md:text-lg text-foreground/70 max-w-prose">
            The work of your life, held side by side. Progress is felt, not measured.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="hidden md:inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
        >
          <Plus className="w-4 h-4" />
          New project
        </button>
      </header>

      {/* ─── Filter chips ─── */}
      {items.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <FilterChip current={filter} value="all" onSelect={setFilter} label="All" />
          <FilterChip current={filter} value="active" onSelect={setFilter} label="Active" />
          {usedCategories.map((c) => (
            <FilterChip
              key={c.id}
              current={filter}
              value={c.id}
              onSelect={setFilter}
              label={c.label}
              tint={c.tint}
            />
          ))}
          <FilterChip current={filter} value="completed" onSelect={setFilter} label="Complete" />
        </div>
      )}

      {/* ─── Cards ─── */}
      {empty ? (
        <EmptyState onAdd={openNew} />
      ) : noMatches ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <p className="font-serif italic text-foreground/60">
            Nothing in this category yet. Try another, or start a new project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={() => openEdit(p)}
              onToggleMilestone={(mid) => toggleMilestone(p.id, mid)}
            />
          ))}
        </div>
      )}

      {/* ─── Mobile FAB ─── */}
      <button
        type="button"
        onClick={openNew}
        className="md:hidden fixed right-5 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        aria-label="New project"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ─── Editor ─── */}
      <ProjectEditor
        state={editorState}
        onClose={closeEditor}
        onSave={handleSave}
        onDelete={editorState ? handleDelete : undefined}
      />
    </div>
  )
}

interface FilterChipProps {
  current: Filter
  value: Filter
  onSelect: (v: Filter) => void
  label: string
  tint?: string
}

function FilterChip({ current, value, onSelect, label, tint }: FilterChipProps) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all",
        active
          ? "bg-primary/12 text-primary font-medium"
          : "text-foreground/60 hover:text-foreground hover:bg-card/60",
      )}
      aria-pressed={active}
    >
      {tint && (
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tint }} aria-hidden />
      )}
      <span>{label}</span>
    </button>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border bg-card/40 backdrop-blur-sm py-16 md:py-24 px-6 text-center">
      <div className="inline-flex w-14 h-14 rounded-full bg-primary/12 text-primary items-center justify-center mb-5">
        <Target className="w-7 h-7" />
      </div>
      <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-foreground mb-3">
        Begin a thread
      </h2>
      <p className="font-serif italic text-foreground/65 max-w-md mx-auto mb-6">
        Track what you are tending — fitness, home, career, travel, money, creative work. Each has its own colour.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
      >
        <Plus className="w-4 h-4" />
        Start your first project
      </button>
    </div>
  )
}
