"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PALETTES } from "@/lib/palettes"
import { usePalette } from "@/components/palette-provider"

export function PalettePicker() {
  const { palette, setPalette } = usePalette()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {PALETTES.map((p) => {
        const isActive = p.id === palette
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPalette(p.id)}
            className={cn(
              "group relative flex items-center gap-4 rounded-2xl border bg-card/70 backdrop-blur-sm p-4 text-left transition-all",
              isActive
                ? "border-primary/60 shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
                : "border-border hover:border-primary/40 hover:bg-card",
            )}
            aria-pressed={isActive}
          >
            {/* Swatch stack — vertical stripe of color circles */}
            <div className="flex -space-x-2 shrink-0">
              {p.swatches.map((color, i) => (
                <span
                  key={i}
                  className="w-7 h-7 rounded-full border border-card shadow-sm"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-serif text-lg text-foreground">{p.name}</p>
                {isActive && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/60 italic font-serif mt-0.5">{p.whisper}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
