"use client"

import { useEffect, useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { prettyDate, type JournalEntry } from "@/lib/data/journal"

interface JournalEntryCardProps {
  entry: JournalEntry
  onChange: (body: string) => void
  onRemove: () => void
  /** Newly-created entries start expanded so the user can type immediately. */
  autoExpand?: boolean
}

/**
 * Editorial entry card with collapsed preview ↔ expanded editor.
 * - Collapsed: prompt eyebrow + date + 2-line italic preview.
 * - Expanded: full textarea, autosaves on every keystroke.
 * - Delete button appears on hover and confirms before destroying.
 */
export function JournalEntryCard({ entry, onChange, onRemove, autoExpand }: JournalEntryCardProps) {
  const [expanded, setExpanded] = useState(!!autoExpand || entry.body.length === 0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasBody = entry.body.trim().length > 0

  useEffect(() => {
    if (expanded && textareaRef.current) {
      autosize(textareaRef.current)
      if (autoExpand) textareaRef.current.focus()
    }
  }, [expanded, autoExpand])

  const collapse = () => {
    if (hasBody) setExpanded(false)
  }

  const promptLine = entry.prompt || "A loose page"
  const dateLine = prettyDate(entry.isoDate)

  return (
    <article
      className={cn(
        "group relative rounded-2xl border border-border bg-card/70 backdrop-blur-sm transition-all",
        "hover:border-primary/40",
        expanded && "ring-1 ring-primary/30",
      )}
    >
      <div className="px-5 md:px-6 py-4 md:py-5">
        {/* eyebrow row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary truncate">
              {promptLine}
            </p>
            <p className="text-xs text-foreground/55 mt-0.5">{dateLine}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this entry? This cannot be undone.")) {
                onRemove()
              }
            }}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-foreground/35 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        {expanded ? (
          <textarea
            ref={textareaRef}
            value={entry.body}
            onChange={(e) => {
              onChange(e.target.value)
              autosize(e.currentTarget)
            }}
            onBlur={collapse}
            placeholder="Begin where you are…"
            rows={3}
            className="w-full bg-transparent font-serif text-lg md:text-xl text-foreground placeholder:text-foreground/35 leading-relaxed resize-none focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full text-left font-serif text-lg md:text-xl leading-relaxed text-foreground/90 hover:text-foreground transition-colors"
          >
            <p className="line-clamp-3 whitespace-pre-wrap">
              {entry.body || (
                <span className="italic text-foreground/40">Begin where you are…</span>
              )}
            </p>
          </button>
        )}
      </div>
    </article>
  )
}

function autosize(el: HTMLTextAreaElement) {
  el.style.height = "auto"
  el.style.height = `${el.scrollHeight}px`
}
