"use client"

import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAudio } from "@/components/audio-provider"

interface AudioToggleProps {
  className?: string
}

export function AudioToggle({ className }: AudioToggleProps) {
  const { enabled, toggle } = useAudio()
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
        enabled
          ? "text-primary hover:bg-card/60"
          : "text-foreground/55 hover:text-foreground hover:bg-card/60",
        className,
      )}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute sound" : "Turn on sound"}
      title={enabled ? "Sound on" : "Sound off"}
    >
      {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  )
}
