"use client"

import { useEffect, useMemo, useState } from "react"

/**
 * Soft petal burst — 14 petals fall from the top of the screen with
 * deterministic horizontal positions and drift so SSR/CSR match.
 * Remount via a changing `triggerKey` to fire each burst.
 *
 * Designed for the project-complete moment: fires alongside the
 * synth bell, lasts ~2.4 s, then unmounts itself.
 */
interface PetalConfettiProps {
  /** Increment to re-trigger the burst. */
  triggerKey: number
  /** Petal colour. Use the project's category tint. */
  color: string
}

interface Petal {
  id: number
  xPct: number
  delayMs: number
  driftPx: number
  rotateDeg: number
  durationMs: number
}

export function PetalConfetti({ triggerKey, color }: PetalConfettiProps) {
  const [visible, setVisible] = useState(triggerKey > 0)

  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      // Distribute across center with slight per-burst variation
      xPct: 32 + ((i * 13 + triggerKey * 7) % 36),
      delayMs: i * 60,
      driftPx: ((i * 11 + triggerKey * 5) % 70) - 35,
      rotateDeg: 180 + ((i * 47) % 540),
      durationMs: 1900 + ((i * 7) % 700),
    }))
  }, [triggerKey])

  useEffect(() => {
    if (triggerKey === 0) {
      setVisible(false)
      return
    }
    setVisible(true)
    const t = window.setTimeout(() => setVisible(false), 2800)
    return () => window.clearTimeout(t)
  }, [triggerKey])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={
            {
              left: `${p.xPct}%`,
              top: "12%",
              animationDelay: `${p.delayMs}ms`,
              animationDuration: `${p.durationMs}ms`,
              backgroundColor: color,
              "--drift": `${p.driftPx}px`,
              "--rot": `${p.rotateDeg}deg`,
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        .petal {
          position: absolute;
          width: 12px;
          height: 16px;
          border-radius: 50% 0 50% 50%;
          opacity: 0;
          transform-origin: center;
          animation-name: petal-fall;
          animation-timing-function: cubic-bezier(0.35, 0, 0.7, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
          filter: drop-shadow(0 2px 3px color-mix(in srgb, currentColor 35%, transparent));
        }
        @keyframes petal-fall {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
          }
          100% {
            transform: translate(var(--drift, 0), 90vh) rotate(var(--rot, 360deg));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
