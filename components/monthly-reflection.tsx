"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { useReflection } from "@/lib/data/hooks"

interface MonthlyReflectionProps {
  month: string
}

export function MonthlyReflection({ month }: MonthlyReflectionProps) {
  const { reflection, setReflection } = useReflection(month)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-card/30 backdrop-blur-sm rounded-lg border border-bronze-brown/10 hover:border-branded-melon/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-bronze-brown" />
          <h2 className="font-serif text-2xl font-light text-ink">Monthly Reflection</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-bronze-brown" />
        ) : (
          <ChevronDown className="w-5 h-5 text-bronze-brown" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-bronze-brown/10 space-y-6">
          <div>
            <label className="block font-serif text-lg text-bronze-brown mb-2">What helped?</label>
            <textarea
              value={reflection.helped}
              onChange={(e) => setReflection((prev) => ({ ...prev, helped: e.target.value }))}
              placeholder="The practices, patterns, or support that made a difference..."
              className="w-full px-4 py-3 bg-paper border border-bronze-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-branded-melon/50 text-ink leading-relaxed resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-serif text-lg text-bronze-brown mb-2">What resisted?</label>
            <textarea
              value={reflection.resisted}
              onChange={(e) => setReflection((prev) => ({ ...prev, resisted: e.target.value }))}
              placeholder="The challenges, obstacles, or patterns that came up..."
              className="w-full px-4 py-3 bg-paper border border-bronze-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-branded-melon/50 text-ink leading-relaxed resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-serif text-lg text-bronze-brown mb-2">What do I want to adjust?</label>
            <textarea
              value={reflection.adjust}
              onChange={(e) => setReflection((prev) => ({ ...prev, adjust: e.target.value }))}
              placeholder="Changes, experiments, or shifts to try..."
              className="w-full px-4 py-3 bg-paper border border-bronze-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-branded-melon/50 text-ink leading-relaxed resize-none"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  )
}
