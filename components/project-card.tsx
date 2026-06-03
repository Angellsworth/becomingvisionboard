"use client"

import { Pencil, Circle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryInfo, STATUS_LABELS, type LifeProject } from "@/lib/data/projects"

interface ProjectCardProps {
  project: LifeProject
  onEdit: () => void
  onToggleMilestone: (milestoneId: string) => void
}

export function ProjectCard({ project, onEdit, onToggleMilestone }: ProjectCardProps) {
  const cat = categoryInfo(project.category)
  const completed = project.milestones.filter((m) => m.done).length
  const paused = project.status === "paused"
  const done = project.status === "completed"

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 md:p-6 transition-all",
        "hover:border-primary/40 hover:shadow-sm",
        paused && "opacity-65",
        done && "border-primary/40 bg-primary/[0.04]",
      )}
    >
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: cat.tint }}
            aria-hidden
          />
          <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/60">
            {cat.label}
          </span>
          {project.status !== "active" && (
            <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/45">
              · {STATUS_LABELS[project.status]}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 w-8 h-8 rounded-full text-foreground/40 hover:text-primary hover:bg-card transition-colors flex items-center justify-center"
          aria-label="Edit project"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Title + description ─── */}
      <h3 className="font-serif text-xl md:text-2xl text-foreground leading-tight mb-1.5">
        {project.title}
      </h3>
      {project.description && (
        <p className="text-sm text-foreground/65 leading-relaxed font-serif italic mb-4">
          {project.description}
        </p>
      )}

      {/* ─── Watercolor progress bar ─── */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">
            Progress
          </span>
          <span className="font-serif text-sm text-foreground/80 tabular-nums">
            {project.progress}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${project.progress}%`,
              background: `linear-gradient(90deg, ${cat.tint}aa 0%, ${cat.tint} 60%, ${cat.tint}cc 100%)`,
            }}
          />
        </div>
      </div>

      {/* ─── Milestones ─── */}
      {project.milestones.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">
              Milestones
            </span>
            <span className="font-serif text-xs text-foreground/55 tabular-nums">
              {completed} of {project.milestones.length}
            </span>
          </div>
          <ul className="space-y-1">
            {project.milestones.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onToggleMilestone(m.id)}
                  className="w-full flex items-start gap-2 text-left py-1 group"
                >
                  {m.done ? (
                    <CheckCircle2 className="w-4 h-4 mt-1 shrink-0" style={{ color: cat.tint }} />
                  ) : (
                    <Circle className="w-4 h-4 mt-1 shrink-0 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
                  )}
                  <span
                    className={cn(
                      "font-serif text-sm leading-snug",
                      m.done ? "text-foreground/55 line-through" : "text-foreground/85",
                    )}
                  >
                    {m.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
