"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react"

interface MonthlyReflectionProps {
  month: string
}

export function MonthlyReflection({ month }: MonthlyReflectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reflections, setReflections] = useState({
    helped: "",
    resisted: "",
    adjust: "",
  })

  useEffect(() => {
    const saved = localStorage.getItem(`reflection-${month}`)
    if (saved) {
      setReflections(JSON.parse(saved))
    }
  }, [month])

  useEffect(() => {
    if (reflections.helped || reflections.resisted || reflections.adjust) {
      localStorage.setItem(`reflection-${month}`, JSON.stringify(reflections))
    }
  }, [reflections, month])

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
              value={reflections.helped}
              onChange={(e) => setReflections({ ...reflections, helped: e.target.value })}
              placeholder="The practices, patterns, or support that made a difference..."
              className="w-full px-4 py-3 bg-paper border border-bronze-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-branded-melon/50 text-ink leading-relaxed resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-serif text-lg text-bronze-brown mb-2">What resisted?</label>
            <textarea
              value={reflections.resisted}
              onChange={(e) => setReflections({ ...reflections, resisted: e.target.value })}
              placeholder="The challenges, obstacles, or patterns that came up..."
              className="w-full px-4 py-3 bg-paper border border-bronze-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-branded-melon/50 text-ink leading-relaxed resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-serif text-lg text-bronze-brown mb-2">What do I want to adjust?</label>
            <textarea
              value={reflections.adjust}
              onChange={(e) => setReflections({ ...reflections, adjust: e.target.value })}
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
