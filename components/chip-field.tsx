"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChipFieldProps {
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  /** Optional suggestions shown as tappable chips when empty / on demand. */
  suggestions?: string[]
}

/**
 * Editable chip group. Click × on any chip to remove. Click "+ add"
 * to reveal an input; press Enter to commit, Escape to cancel.
 * If suggestions are provided, they appear underneath as one-tap
 * fill-ins (excluding ones already chosen).
 */
export function ChipField({ values, onChange, placeholder = "add", suggestions }: ChipFieldProps) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setDraft("")
    setAdding(false)
  }

  const remove = (v: string) => onChange(values.filter((x) => x !== v))
  const addSuggestion = (s: string) => {
    if (values.includes(s)) return
    onChange([...values, s])
  }

  const remainingSuggestions = suggestions?.filter((s) => !values.includes(s)) ?? []

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-full bg-primary/12 text-foreground text-sm border border-primary/30"
          >
            <span className="font-serif italic">{v}</span>
            <button
              type="button"
              onClick={() => remove(v)}
              className="w-5 h-5 inline-flex items-center justify-center rounded-full text-foreground/55 hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={`Remove ${v}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit()
              if (e.key === "Escape") {
                setDraft("")
                setAdding(false)
              }
            }}
            placeholder={placeholder}
            className="px-3 py-1.5 rounded-full bg-card border border-primary/40 text-sm font-serif italic text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[8rem]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border text-foreground/55 hover:text-primary hover:border-primary/60 transition-colors text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            add
          </button>
        )}
      </div>

      {remainingSuggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/40 mb-2">
            Try
          </p>
          <div className="flex flex-wrap gap-1.5">
            {remainingSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSuggestion(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs text-foreground/55 hover:text-foreground",
                  "bg-muted/40 hover:bg-muted/70 transition-colors font-serif italic",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
