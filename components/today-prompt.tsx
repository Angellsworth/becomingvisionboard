"use client"

import { useEffect, useRef, useState } from "react"
import { Quote } from "lucide-react"

interface TodayPromptProps {
  prompt: string
  dateLine: string
  initialBody: string
  onWrite: (body: string) => void
}

/**
 * The hero "today's prompt" card. Always shows the prompt, even if the
 * user hasn't written. Textarea autosizes and autosaves on every
 * keystroke (via onWrite).
 */
export function TodayPrompt({ prompt, dateLine, initialBody, onWrite }: TodayPromptProps) {
  const [body, setBody] = useState(initialBody)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Keep internal state in sync if the parent reloads a different entry
  // (e.g. on hydration).
  useEffect(() => {
    setBody(initialBody)
  }, [initialBody])

  useEffect(() => {
    if (textareaRef.current) autosize(textareaRef.current)
  }, [body])

  return (
    <section className="rounded-3xl border border-border bg-card/70 backdrop-blur-sm px-5 md:px-8 py-6 md:py-8 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <Quote className="w-4 h-4 text-primary" aria-hidden />
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary">Today's prompt</p>
        <span className="text-foreground/30" aria-hidden>·</span>
        <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/55">{dateLine}</p>
      </div>
      <h2 className="font-display text-4xl md:text-5xl tracking-[0.04em] leading-[1.1] text-foreground mb-5 md:mb-6">
        {prompt}
      </h2>
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => {
          setBody(e.target.value)
          onWrite(e.target.value)
          autosize(e.currentTarget)
        }}
        placeholder="Begin where you are…"
        rows={4}
        className="w-full bg-transparent font-serif text-lg md:text-xl text-foreground placeholder:text-foreground/35 leading-relaxed resize-none focus:outline-none"
      />
      <div className="mt-3 text-[11px] tracking-[0.2em] uppercase text-foreground/40">
        Saving as you write
      </div>
    </section>
  )
}

function autosize(el: HTMLTextAreaElement) {
  el.style.height = "auto"
  el.style.height = `${Math.max(el.scrollHeight, 160)}px`
}
