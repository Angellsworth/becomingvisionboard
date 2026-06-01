"use client"

import { useState, useEffect } from "react"
import { Plus, X, Circle, CheckCircle2, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface Practice {
  id: string
  text: string
  isPaused: boolean
  completedDays: string[] // ISO date strings
}

interface BecomingPracticesProps {
  month: string
}

export function BecomingPractices({ month }: BecomingPracticesProps) {
  const [practices, setPractices] = useState<Practice[]>([])
  const [newPractice, setNewPractice] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`practices-${month}`)
      if (saved) setPractices(JSON.parse(saved))
      else setPractices([])
    } catch {
      setPractices([])
    }
    setHydrated(true)
  }, [month])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(`practices-${month}`, JSON.stringify(practices))
  }, [practices, month, hydrated])

  const addPractice = () => {
    if (!newPractice.trim()) return

    const practice: Practice = {
      id: `${Date.now()}`,
      text: newPractice,
      isPaused: false,
      completedDays: [],
    }

    setPractices([...practices, practice])
    setNewPractice("")
    setIsAdding(false)
  }

  const removePractice = (id: string) => {
    setPractices(practices.filter((p) => p.id !== id))
  }

  const togglePractice = (id: string) => {
    const today = new Date().toISOString().split("T")[0]
    setPractices(
      practices.map((p) => {
        if (p.id !== id) return p
        const isCompleted = p.completedDays.includes(today)
        return {
          ...p,
          completedDays: isCompleted ? p.completedDays.filter((d) => d !== today) : [...p.completedDays, today],
        }
      }),
    )
  }

  const togglePause = (id: string) => {
    setPractices(practices.map((p) => (p.id === id ? { ...p, isPaused: !p.isPaused } : p)))
  }

  const updatePracticeText = (id: string, text: string) => {
    setPractices(practices.map((p) => (p.id === id ? { ...p, text } : p)))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-grape-soda/20">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-light text-ink mb-2">Becoming Practices</h2>
          <p className="text-grape-soda text-sm">Small, repeatable baby steps</p>
        </div>

        <div className="space-y-3">
          {practices.map((practice) => (
            <PracticeItem
              key={practice.id}
              practice={practice}
              onToggle={() => togglePractice(practice.id)}
              onRemove={() => removePractice(practice.id)}
              onTogglePause={() => togglePause(practice.id)}
              onUpdateText={(text) => updatePracticeText(practice.id, text)}
            />
          ))}

          {practices.length === 0 && !isAdding && (
            <div className="text-center py-12 text-dusk-blue/70">
              <p className="font-serif text-lg mb-4">No practices yet</p>
              <p className="text-sm">Start with 3-7 small, repeatable actions</p>
            </div>
          )}

          {isAdding ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newPractice}
                onChange={(e) => setNewPractice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addPractice()
                  if (e.key === "Escape") {
                    setIsAdding(false)
                    setNewPractice("")
                  }
                }}
                placeholder="e.g., Write for 10 minutes..."
                className="flex-1 px-4 py-3 bg-paper border border-silver/30 rounded-md focus:outline-none focus:ring-2 focus:ring-dusk-blue/50 text-ink"
                autoFocus
              />
              <button
                onClick={addPractice}
                className="px-4 py-3 bg-dusk-blue text-white rounded-md hover:bg-pacific-blue transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewPractice("")
                }}
                className="px-4 py-3 bg-transparent border border-silver/30 text-grape-soda rounded-md hover:bg-grape-soda/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-dashed border-silver/40 text-dusk-blue rounded-md hover:border-dusk-blue hover:text-pacific-blue transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Practice
            </button>
          )}
        </div>

        {practices.length > 0 && (
          <div className="mt-8 pt-6 border-t border-grape-soda/20">
            <p className="text-xs text-grape-soda/70 text-center">
              Progress is felt, not measured. Missed days are neutral.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface PracticeItemProps {
  practice: Practice
  onToggle: () => void
  onRemove: () => void
  onTogglePause: () => void
  onUpdateText: (text: string) => void
}

function PracticeItem({ practice, onToggle, onRemove, onTogglePause, onUpdateText }: PracticeItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(practice.text)
  const today = new Date().toISOString().split("T")[0]
  const isCompletedToday = practice.completedDays.includes(today)

  // Calculate visual depth based on recent completions (last 7 days)
  const recentCompletions = practice.completedDays.filter((date) => {
    const daysDiff = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }).length

  const depthOpacity = Math.min(0.3 + recentCompletions * 0.1, 1)

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdateText(editText)
    }
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-4 rounded-lg border transition-all",
        practice.isPaused ? "bg-silver/20 border-silver/30" : "bg-paper border-silver/20 hover:border-grape-soda/50",
      )}
    >
      <button
        onClick={onToggle}
        disabled={practice.isPaused}
        className={cn(
          "flex-shrink-0 transition-all",
          practice.isPaused ? "opacity-40 cursor-not-allowed" : "hover:scale-110",
        )}
        style={{ opacity: practice.isPaused ? 0.4 : depthOpacity }}
      >
        {isCompletedToday ? (
          <CheckCircle2 className="w-6 h-6 text-pacific-blue" />
        ) : (
          <Circle className="w-6 h-6 text-silver" />
        )}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit()
            if (e.key === "Escape") {
              setEditText(practice.text)
              setIsEditing(false)
            }
          }}
          className="flex-1 px-2 py-1 bg-transparent border-b border-dusk-blue focus:outline-none text-ink"
          autoFocus
        />
      ) : (
        <p
          onClick={() => !practice.isPaused && setIsEditing(true)}
          className={cn(
            "flex-1 text-ink leading-relaxed cursor-pointer",
            practice.isPaused && "text-silver line-through",
          )}
        >
          {practice.text}
        </p>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePause}
          className="p-2 text-grape-soda hover:text-dusk-blue transition-colors"
          title={practice.isPaused ? "Resume practice" : "Pause practice"}
        >
          <Pause className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-2 text-grape-soda hover:text-vintage-berry transition-colors"
          title="Remove practice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
