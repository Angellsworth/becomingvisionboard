"use client"

import { useEffect, useState } from "react"
import { X, Trash2, Plus, GripVertical, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATEGORIES,
  makeMilestone,
  STATUS_LABELS,
  type LifeProject,
  type Milestone,
  type ProjectCategory,
  type ProjectStatus,
} from "@/lib/data/projects"

interface ProjectDraft {
  title: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  progress: number
  milestones: Milestone[]
}

interface ProjectEditorProps {
  /** undefined = closed, null = new, LifeProject = editing */
  state: LifeProject | null | undefined
  onClose: () => void
  onSave: (draft: ProjectDraft) => void
  onDelete?: () => void
}

const EMPTY: ProjectDraft = {
  title: "",
  description: "",
  category: "wellness",
  status: "active",
  progress: 0,
  milestones: [],
}

export function ProjectEditor({ state, onClose, onSave, onDelete }: ProjectEditorProps) {
  const open = state !== undefined
  const isNew = state === null
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY)
  const [newMilestoneText, setNewMilestoneText] = useState("")

  useEffect(() => {
    if (!open) return
    if (isNew) {
      setDraft(EMPTY)
    } else if (state) {
      setDraft({
        title: state.title,
        description: state.description,
        category: state.category,
        status: state.status,
        progress: state.progress,
        milestones: state.milestones,
      })
    }
    setNewMilestoneText("")
  }, [open, isNew, state])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const setField = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const addMilestone = () => {
    const text = newMilestoneText.trim()
    if (!text) return
    setField("milestones", [...draft.milestones, makeMilestone(text)])
    setNewMilestoneText("")
  }
  const toggleMilestone = (id: string) =>
    setField(
      "milestones",
      draft.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)),
    )
  const updateMilestoneText = (id: string, text: string) =>
    setField(
      "milestones",
      draft.milestones.map((m) => (m.id === id ? { ...m, text } : m)),
    )
  const removeMilestone = (id: string) =>
    setField(
      "milestones",
      draft.milestones.filter((m) => m.id !== id),
    )

  const canSave = draft.title.trim().length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close editor"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
      />

      <div className="relative w-full md:max-w-2xl bg-background border-t md:border border-border md:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 md:fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-border">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary">
              {isNew ? "New project" : "Edit project"}
            </p>
            <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-foreground">
              {isNew ? "A new thread" : "Refine"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-foreground/60 hover:text-foreground hover:bg-card/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 md:py-6 space-y-6">
          {/* Title */}
          <Field label="Title">
            <input
              autoFocus={isNew}
              value={draft.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Run a half marathon"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 font-serif text-lg text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </Field>

          {/* Description */}
          <Field label="A line about it (optional)">
            <textarea
              value={draft.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Started training in spring, building gently…"
              rows={2}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 font-serif text-base text-foreground placeholder:text-foreground/35 leading-snug resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </Field>

          {/* Category */}
          <Field label="Category">
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const active = c.id === draft.category
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setField("category", c.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all",
                      active
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border text-foreground/70 hover:text-foreground hover:bg-card",
                    )}
                    aria-pressed={active}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.tint }}
                      aria-hidden
                    />
                    <span className="font-serif">{c.label}</span>
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Status */}
          <Field label="Status">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => {
                const active = s === draft.status
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setField("status", s)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border text-sm transition-all",
                      active
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border text-foreground/70 hover:text-foreground hover:bg-card",
                    )}
                    aria-pressed={active}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Progress */}
          <Field label="Progress (how it feels right now)">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={draft.progress}
                  onChange={(e) => setField("progress", parseInt(e.target.value, 10))}
                  className="flex-1 accent-[var(--primary)]"
                />
                <span className="font-serif text-lg text-foreground/80 w-14 text-right tabular-nums">
                  {draft.progress}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${draft.progress}%`,
                    background: `linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)`,
                  }}
                />
              </div>
            </div>
          </Field>

          {/* Milestones */}
          <Field label="Milestones (optional)">
            <ul className="space-y-1.5">
              {draft.milestones.map((m) => (
                <li
                  key={m.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/60"
                >
                  <GripVertical className="w-4 h-4 text-foreground/25 shrink-0" aria-hidden />
                  <button
                    type="button"
                    onClick={() => toggleMilestone(m.id)}
                    className="shrink-0"
                    aria-label={m.done ? "Mark not done" : "Mark done"}
                  >
                    {m.done ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-foreground/40" />
                    )}
                  </button>
                  <input
                    value={m.text}
                    onChange={(e) => updateMilestoneText(m.id, e.target.value)}
                    className={cn(
                      "flex-1 bg-transparent font-serif text-base focus:outline-none",
                      m.done ? "text-foreground/55 line-through" : "text-foreground",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    className="w-7 h-7 rounded-full inline-flex items-center justify-center text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove milestone"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border focus-within:border-primary/60 transition-colors">
              <Plus className="w-4 h-4 text-foreground/40 shrink-0" aria-hidden />
              <input
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addMilestone()
                  }
                }}
                placeholder="add a milestone"
                className="flex-1 bg-transparent font-serif text-base text-foreground placeholder:text-foreground/35 focus:outline-none"
              />
              {newMilestoneText.trim() && (
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-sm text-primary font-medium"
                >
                  Add
                </button>
              )}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-t border-border bg-background">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this project? This cannot be undone.")) {
                  onDelete()
                }
              }}
              className="inline-flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => canSave && onSave(draft)}
              disabled={!canSave}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                canSave
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-foreground/40 cursor-not-allowed",
              )}
            >
              {isNew ? "Start project" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 mb-2">{label}</p>
      {children}
    </div>
  )
}
