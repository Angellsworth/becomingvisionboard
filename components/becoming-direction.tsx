"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"

interface BecomingDirectionProps {
  month: string
}

export function BecomingDirection({ month }: BecomingDirectionProps) {
  const [direction, setDirection] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`direction-${month}`)
      setDirection(saved ?? "")
    } catch {
      setDirection("")
    }
    setHydrated(true)
  }, [month])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(`direction-${month}`, direction)
  }, [direction, month, hydrated])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 sm:p-8 border border-grape-soda/20">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-pacific-blue" />
          <h2 className="font-serif text-2xl font-light text-ink">Becoming Direction</h2>
        </div>

        <div className="space-y-2">
          <label className="block font-serif text-lg text-dusk-blue">This month I am becoming...</label>

          {isEditing ? (
            <textarea
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              onBlur={() => setIsEditing(false)}
              placeholder="someone who..."
              className="w-full px-4 py-3 bg-paper border border-silver/30 rounded-md focus:outline-none focus:ring-2 focus:ring-dusk-blue/50 text-ink leading-relaxed resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-3 bg-paper/50 border border-silver/20 rounded-md cursor-pointer hover:border-pacific-blue/50 transition-colors min-h-[100px] leading-relaxed"
            >
              {direction ? (
                <p className="text-ink whitespace-pre-wrap">{direction}</p>
              ) : (
                <p className="text-grape-soda/60 italic">Click to write your becoming direction...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
