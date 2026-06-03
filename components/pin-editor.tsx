"use client"

import { useEffect, useRef, useState } from "react"
import { X, ImageUp, Trash2, RotateCcw, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DEFAULT_SIZE,
  SIZE_LABEL,
  type BoardItem,
  type PinSize,
} from "@/lib/data/board-types"

interface PinDraft {
  imageUrl: string
  caption: string
  link: string
  size: PinSize
  rotation: number
}

interface PinEditorProps {
  /** undefined = closed, null = new pin, BoardItem = editing existing */
  state: BoardItem | null | undefined
  onClose: () => void
  onSave: (draft: PinDraft) => void
  onDelete?: () => void
}

const EMPTY: PinDraft = {
  imageUrl: "",
  caption: "",
  link: "",
  size: DEFAULT_SIZE,
  rotation: 0,
}

export function PinEditor({ state, onClose, onSave, onDelete }: PinEditorProps) {
  const open = state !== undefined
  const isNew = state === null
  const [draft, setDraft] = useState<PinDraft>(EMPTY)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync the form to whatever opened (new vs. existing).
  useEffect(() => {
    if (!open) return
    if (isNew) {
      setDraft(EMPTY)
    } else if (state) {
      setDraft({
        imageUrl: state.imageUrl,
        caption: state.caption,
        link: state.link,
        size: state.size,
        rotation: state.rotation,
      })
    }
  }, [open, isNew, state])

  // Close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const setField = <K extends keyof PinDraft>(key: K, value: PinDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const handlePickFile = () => fileInputRef.current?.click()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-picking same file
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      if (url) setField("imageUrl", url)
    }
    reader.readAsDataURL(file)
  }

  const canSave = draft.imageUrl.length > 0
  const sizes: PinSize[] = ["small", "medium", "large"]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close editor"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
      />

      {/* Sheet / modal */}
      <div className="relative w-full md:max-w-2xl bg-background border-t md:border border-border md:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 md:fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-border">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary">
              {isNew ? "New pin" : "Edit pin"}
            </p>
            <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em] text-foreground">
              {isNew ? "Add to your board" : "Refine"}
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
          {/* Image preview + replace */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 mb-2">Image</p>
            {draft.imageUrl ? (
              <div className="relative rounded-2xl border border-border bg-muted/40 p-3 flex flex-col items-center gap-3">
                <div className="max-h-64 w-full overflow-hidden rounded-xl flex items-center justify-center bg-card">
                  <img
                    src={draft.imageUrl}
                    alt="Pin preview"
                    style={{ transform: `rotate(${draft.rotation}deg)` }}
                    className="max-h-64 w-auto object-contain transition-transform"
                  />
                </div>
                <button
                  type="button"
                  onClick={handlePickFile}
                  className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors"
                >
                  <ImageUp className="w-4 h-4" />
                  Replace image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePickFile}
                className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 hover:bg-muted/50 transition-all py-12 flex flex-col items-center gap-3 text-foreground/60 hover:text-foreground"
              >
                <ImageUp className="w-8 h-8" />
                <span className="text-sm">Choose an image</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 mb-2 block">
              Caption
            </label>
            <textarea
              value={draft.caption}
              onChange={(e) => setField("caption", e.target.value)}
              placeholder="What does this remind you of becoming?"
              rows={2}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 font-serif text-base text-foreground placeholder:text-foreground/35 leading-snug resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 mb-2 block">
              Link (optional)
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
              <input
                type="url"
                value={draft.link}
                onChange={(e) => setField("link", e.target.value)}
                placeholder="https://"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 mb-2">Size</p>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => {
                const active = draft.size === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setField("size", s)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border text-sm transition-all",
                      active
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border text-foreground/65 hover:text-foreground hover:bg-card",
                    )}
                    aria-pressed={active}
                  >
                    {SIZE_LABEL[s]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50">Rotation</p>
              <button
                type="button"
                onClick={() => setField("rotation", 0)}
                className="inline-flex items-center gap-1 text-xs text-foreground/60 hover:text-primary transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={draft.rotation}
                onChange={(e) => setField("rotation", parseInt(e.target.value, 10))}
                className="flex-1 accent-[var(--primary)]"
              />
              <span className="font-serif text-lg text-foreground/80 w-12 text-right tabular-nums">
                {draft.rotation}°
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-t border-border bg-background">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this pin? This cannot be undone.")) {
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
              {isNew ? "Add to board" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
