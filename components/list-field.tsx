"use client"

import { useState } from "react"
import { Plus, X, GripVertical } from "lucide-react"

interface ListFieldProps {
  items: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  /** Optional starter suggestions shown when the list is empty. */
  suggestions?: string[]
}

/**
 * Editable list of single-line strings. Each row is inline-editable
 * on click; trailing × deletes; a soft "+ add" row below opens
 * an inline input. Reordering is left to a follow-up — most users
 * add in priority order anyway.
 */
export function ListField({ items, onChange, placeholder = "add", suggestions }: ListFieldProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const [addingNew, setAddingNew] = useState(false)
  const [newDraft, setNewDraft] = useState("")

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditDraft(items[idx])
  }
  const commitEdit = (idx: number) => {
    const trimmed = editDraft.trim()
    if (trimmed) {
      const next = [...items]
      next[idx] = trimmed
      onChange(next)
    } else {
      // empty = delete
      onChange(items.filter((_, i) => i !== idx))
    }
    setEditingIdx(null)
    setEditDraft("")
  }
  const cancelEdit = () => {
    setEditingIdx(null)
    setEditDraft("")
  }

  const commitAdd = () => {
    const trimmed = newDraft.trim()
    if (trimmed) onChange([...items, trimmed])
    setNewDraft("")
    setAddingNew(false)
  }

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx))

  const remainingSuggestions = suggestions?.filter((s) => !items.includes(s)) ?? []

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <div
          key={`${idx}-${item}`}
          className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-colors"
        >
          <GripVertical className="w-4 h-4 text-foreground/25 shrink-0" aria-hidden />
          {editingIdx === idx ? (
            <input
              autoFocus
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              onBlur={() => commitEdit(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit(idx)
                if (e.key === "Escape") cancelEdit()
              }}
              className="flex-1 bg-transparent font-serif text-base text-foreground focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => startEdit(idx)}
              className="flex-1 text-left font-serif text-base text-foreground/90 hover:text-foreground"
            >
              {item}
            </button>
          )}
          <button
            type="button"
            onClick={() => remove(idx)}
            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={`Remove ${item}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {addingNew ? (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary/40 bg-card">
          <Plus className="w-4 h-4 text-primary shrink-0" aria-hidden />
          <input
            autoFocus
            value={newDraft}
            onChange={(e) => setNewDraft(e.target.value)}
            onBlur={commitAdd}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAdd()
              if (e.key === "Escape") {
                setNewDraft("")
                setAddingNew(false)
              }
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent font-serif text-base text-foreground placeholder:text-foreground/35 focus:outline-none"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-border text-foreground/55 hover:text-primary hover:border-primary/60 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          add
        </button>
      )}

      {items.length === 0 && remainingSuggestions.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/40 mb-2">Try</p>
          <div className="flex flex-wrap gap-1.5">
            {remainingSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange([...items, s])}
                className="px-2.5 py-1 rounded-full text-xs text-foreground/55 hover:text-foreground bg-muted/40 hover:bg-muted/70 transition-colors font-serif italic"
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
