"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, Frame, AlertTriangle, X } from "lucide-react"
import { BoardPin } from "@/components/board-pin"
import { PinEditor } from "@/components/pin-editor"
import { board, migrateAnnualCollagesToBoard, shrinkOversizedPins } from "@/lib/data/board-storage"
import type { BoardItem, PinSize } from "@/lib/data/board-types"

/**
 * Becoming Board — Pinterest-style masonry of visual inspiration.
 *
 * State model: a single React state array of BoardItems, mirrored to
 * localStorage on every mutation. Sort is newest-first.
 */
export function BecomingBoard() {
  const [items, setItems] = useState<BoardItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Editor visibility model:
  // - undefined → closed
  // - null      → new pin
  // - BoardItem → editing existing
  const [editorState, setEditorState] = useState<BoardItem | null | undefined>(undefined)

  // Toast for storage failures.
  const [storageError, setStorageError] = useState<string | null>(null)

  // Hydrate from localStorage. Run both migrations:
  // - v1: seed from legacy annual_collage data
  // - v1 shrink: recompress any oversized images so quota doesn't bite later
  useEffect(() => {
    let cancelled = false
    migrateAnnualCollagesToBoard()
    setItems(board.list())
    setHydrated(true)
    ;(async () => {
      const { shrunk } = await shrinkOversizedPins()
      if (!cancelled && shrunk > 0) {
        setItems(board.list())
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const openNew = useCallback(() => setEditorState(null), [])
  const openEdit = useCallback((item: BoardItem) => setEditorState(item), [])
  const closeEditor = useCallback(() => setEditorState(undefined), [])

  const handleSave = useCallback(
    (draft: {
      imageUrl: string
      caption: string
      link: string
      size: PinSize
      rotation: number
    }) => {
      const result =
        editorState === null
          ? board.add(draft)
          : editorState
            ? board.update(editorState.id, draft)
            : null
      if (!result) {
        setStorageError(
          "Storage is full. Try removing a few pins or using smaller images, then add again.",
        )
        return
      }
      setStorageError(null)
      setItems(board.list())
      closeEditor()
    },
    [editorState, closeEditor],
  )

  const handleDelete = useCallback(() => {
    if (!editorState) return
    board.remove(editorState.id)
    setItems(board.list())
    closeEditor()
  }, [editorState, closeEditor])

  const empty = hydrated && items.length === 0

  const renderedPins = useMemo(
    () =>
      items.map((item) => (
        <BoardPin key={item.id} item={item} onEdit={() => openEdit(item)} />
      )),
    [items, openEdit],
  )

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-24 md:pb-16">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-mark" aria-hidden />
            <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-primary">
              Becoming Board
            </p>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-[0.04em] leading-[1.02] text-foreground">
            What you are calling in
          </h1>
          <p className="mt-3 font-serif italic text-base md:text-lg text-foreground/70 max-w-prose">
            A living gallery of images for the woman you are becoming. Add, edit, rearrange — make it yours.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="hidden md:inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
        >
          <Plus className="w-4 h-4" />
          Add a pin
        </button>
      </header>

      {/* Storage warning toast */}
      {storageError && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border border-destructive/40 bg-destructive/10 text-foreground">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm flex-1 leading-relaxed">{storageError}</p>
          <button
            type="button"
            onClick={() => setStorageError(null)}
            className="text-foreground/50 hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {empty ? (
        <EmptyState onAdd={openNew} />
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4" style={{ columnFill: "balance" }}>
          {renderedPins}
        </div>
      )}

      <button
        type="button"
        onClick={openNew}
        className="md:hidden fixed right-5 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        aria-label="Add a pin"
      >
        <Plus className="w-6 h-6" />
      </button>

      <PinEditor
        state={editorState}
        onClose={closeEditor}
        onSave={handleSave}
        onDelete={editorState ? handleDelete : undefined}
      />
    </div>
  )
}

interface EmptyStateProps {
  onAdd: () => void
}

function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border bg-card/40 backdrop-blur-sm py-16 md:py-24 px-6 text-center">
      <div className="inline-flex w-14 h-14 rounded-full bg-primary/12 text-primary items-center justify-center mb-5">
        <Frame className="w-7 h-7" />
      </div>
      <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-foreground mb-3">
        Begin a board
      </h2>
      <p className="font-serif italic text-foreground/65 max-w-md mx-auto mb-6">
        Pin photos, art, dreams, future plans — the visual language of the woman you are becoming.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
      >
        <Plus className="w-4 h-4" />
        Add your first pin
      </button>
    </div>
  )
}
