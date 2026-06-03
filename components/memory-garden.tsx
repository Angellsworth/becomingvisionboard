"use client"

import { useEffect, useMemo, useState } from "react"
import { Feather, Flower2, Sparkles, Target } from "lucide-react"
import {
  beeCountFor,
  computeGardenStats,
  phaseFor,
  type GardenStats,
} from "@/lib/data/garden-state"
import { startAmbient, stopAmbient } from "@/lib/audio/engine"
import { useAudio } from "@/components/audio-provider"

/**
 * Memory Garden — Monument Valley by way of a vision board.
 *
 * Flat geometric forms in pastel layers, with a small shrine at the
 * back and a flower bed in front. Each item the user tends (a journal
 * entry, a project, a completed milestone) becomes a bloom. Once the
 * scene is full enough, bees arrive and trace soft arcs through the
 * sky. The scene's colors are bound to CSS variables so it adapts to
 * whichever palette the user has chosen.
 *
 * Storage signal:
 *   tokens = reflections + 0.5 * completed milestones + tending + 3 * complete
 *
 * Phases unlock additional whisper text underneath the scene.
 */
export function MemoryGarden() {
  const [stats, setStats] = useState<GardenStats | null>(null)
  const { enabled: audioEnabled } = useAudio()

  // Compute after mount — keeps SSR and CSR markup consistent.
  useEffect(() => {
    setStats(computeGardenStats())
  }, [])

  // Start/stop the ambient pad with the page and the audio toggle.
  useEffect(() => {
    if (audioEnabled) {
      startAmbient()
    }
    return () => {
      stopAmbient()
    }
  }, [audioEnabled])

  const ready = stats !== null
  const tokens = stats?.tokens ?? 0
  const phase = phaseFor(tokens)
  const beeCount = beeCountFor(tokens)

  // How many flower slots to fill. Capped at the spot list length.
  const visibleFlowers = useMemo(() => {
    return Math.min(tokens, FLOWER_SPOTS.length)
  }, [tokens])

  // Render flowers back-to-front (sorted by y ascending) so closer
  // blooms layer on top. Stable keys via original spot index.
  const renderedFlowers = useMemo(() => {
    const visible = FLOWER_SPOTS.slice(0, visibleFlowers).map((spot, idx) => ({
      ...spot,
      idx,
    }))
    return visible.sort((a, b) => a.y - b.y)
  }, [visibleFlowers])

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-24 md:pb-16">
      {/* ─── Header ─── */}
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-mark" aria-hidden />
          <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-primary">
            Memory Garden
          </p>
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-[0.04em] leading-[1.02] text-foreground">
          What you tend, blooms
        </h1>
        <p className="mt-3 font-serif italic text-base md:text-lg text-foreground/70 max-w-prose">
          A small living scene. Every reflection waters something. Every project completed adds a bloom.
        </p>
      </header>

      {/* ─── Scene ─── */}
      <div
        className="relative rounded-3xl border border-border overflow-hidden shadow-sm"
        style={{
          aspectRatio: "1000 / 500",
          opacity: ready ? 1 : 0,
          transition: "opacity 700ms ease",
        }}
      >
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="color-mix(in srgb, var(--background) 90%, white)"
              />
              <stop
                offset="55%"
                stopColor="color-mix(in srgb, var(--secondary) 22%, var(--background))"
              />
              <stop
                offset="100%"
                stopColor="color-mix(in srgb, var(--primary) 18%, var(--background))"
              />
            </linearGradient>
            <linearGradient id="path-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--primary) 14%, var(--card))" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--primary) 28%, var(--card))" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect x="0" y="0" width="1000" height="500" fill="url(#sky)" />

          {/* Soft sun */}
          <circle
            cx="820"
            cy="120"
            r="46"
            fill="color-mix(in srgb, var(--secondary) 55%, white)"
            opacity="0.7"
          />
          <circle
            cx="820"
            cy="120"
            r="62"
            fill="color-mix(in srgb, var(--secondary) 35%, white)"
            opacity="0.35"
          />

          {/* Far mountain */}
          <path
            d="M -20 320 L 140 240 L 280 290 L 440 220 L 600 280 L 780 230 L 1020 270 L 1020 360 L -20 360 Z"
            fill="color-mix(in srgb, var(--accent) 32%, var(--background))"
            opacity="0.65"
          />

          {/* Closer hill */}
          <path
            d="M -20 360 L 200 320 L 400 350 L 620 318 L 820 348 L 1020 330 L 1020 410 L -20 410 Z"
            fill="color-mix(in srgb, var(--accent) 55%, var(--background))"
            opacity="0.85"
          />

          {/* Monument — small geometric shrine, back center */}
          <Monument x={500} groundY={400} />

          {/* Stone path — narrow trapezoid from monument to foreground */}
          <path
            d="M 475 360 L 525 360 L 600 500 L 400 500 Z"
            fill="url(#path-gradient)"
            opacity="0.9"
          />
          {/* Path tile lines for texture */}
          {[0, 1, 2, 3].map((i) => {
            const t = (i + 1) / 5
            const left = 475 + (400 - 475) * t
            const right = 525 + (600 - 525) * t
            const y = 360 + (500 - 360) * t
            return (
              <line
                key={i}
                x1={left}
                y1={y}
                x2={right}
                y2={y}
                stroke="color-mix(in srgb, var(--primary) 35%, transparent)"
                strokeWidth={1.2}
                opacity={0.5}
              />
            )
          })}

          {/* Foreground lawn */}
          <rect
            x="0"
            y="410"
            width="1000"
            height="90"
            fill="color-mix(in srgb, var(--accent) 65%, var(--background))"
          />
          {/* Subtle grass-blade lines */}
          {Array.from({ length: 32 }).map((_, i) => {
            const x = (i / 31) * 1000
            // skip the path band
            if (x > 395 && x < 605) return null
            const h = 4 + ((i * 7) % 5)
            const y = 410 + ((i * 13) % 6)
            return (
              <line
                key={i}
                x1={x}
                y1={y + h}
                x2={x}
                y2={y}
                stroke="color-mix(in srgb, var(--accent) 90%, black)"
                strokeWidth={1}
                opacity={0.35}
              />
            )
          })}

          {/* Flowers, back-to-front */}
          {renderedFlowers.map((spot) => (
            <Flower
              key={spot.idx}
              x={spot.x}
              y={spot.y}
              type={spot.type}
              scale={spot.scale}
              color={FLOWER_COLORS[spot.colorIdx % FLOWER_COLORS.length]}
            />
          ))}

          {/* Bees, on top */}
          {Array.from({ length: beeCount }).map((_, i) => (
            <Bee key={i} pathIdx={i} />
          ))}
        </svg>

        {/* Subtle vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            boxShadow:
              "inset 0 0 80px color-mix(in srgb, var(--primary) 12%, transparent)",
          }}
        />
      </div>

      {/* ─── Whisper + phase ─── */}
      <div className="mt-6 md:mt-8 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/55 mb-2">
          {ready ? phase.name : "Loading"}
        </p>
        <p className="font-serif italic text-xl md:text-2xl text-foreground/85 max-w-xl mx-auto">
          {ready ? phase.whisper : "…"}
        </p>
      </div>

      {/* ─── Stats ─── */}
      <div className="mt-10 md:mt-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="section-mark" aria-hidden />
          <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/55">
            The garden, so far
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={Feather} label="Reflections" value={stats?.reflections ?? 0} />
          <StatCard icon={Target} label="Tending" value={stats?.tending ?? 0} />
          <StatCard icon={Sparkles} label="Milestones" value={stats?.milestones ?? 0} />
          <StatCard icon={Flower2} label="Complete" value={stats?.complete ?? 0} />
        </div>
      </div>

      {/* Local styles for bees + wings.
          (Flower sway was here but caused a CSS-vs-SVG transform clash
          that made each flower jump to (0,0) at the peak of every cycle.
          Removed for stability; bees provide the scene's motion.) */}
      <style jsx>{`
        :global(.garden-bee-wings) {
          transform-box: fill-box;
          transform-origin: center;
          animation: garden-wings 0.18s ease-in-out infinite alternate;
        }
        @keyframes garden-wings {
          0% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(0.4);
          }
        }
        :global(.garden-bee-0) {
          animation: garden-bee-path-0 28s ease-in-out infinite;
        }
        :global(.garden-bee-1) {
          animation: garden-bee-path-1 32s ease-in-out infinite;
        }
        :global(.garden-bee-2) {
          animation: garden-bee-path-2 24s ease-in-out infinite;
        }
        :global(.garden-bee-3) {
          animation: garden-bee-path-3 30s ease-in-out infinite;
        }
        @keyframes garden-bee-path-0 {
          0% { transform: translate(80px, 240px); }
          20% { transform: translate(280px, 140px); }
          45% { transform: translate(700px, 170px); }
          65% { transform: translate(820px, 280px); }
          85% { transform: translate(420px, 320px); }
          100% { transform: translate(80px, 240px); }
        }
        @keyframes garden-bee-path-1 {
          0% { transform: translate(920px, 200px); }
          25% { transform: translate(640px, 90px); }
          50% { transform: translate(220px, 220px); }
          75% { transform: translate(380px, 340px); }
          100% { transform: translate(920px, 200px); }
        }
        @keyframes garden-bee-path-2 {
          0% { transform: translate(500px, 80px); }
          25% { transform: translate(180px, 260px); }
          50% { transform: translate(540px, 360px); }
          75% { transform: translate(880px, 240px); }
          100% { transform: translate(500px, 80px); }
        }
        @keyframes garden-bee-path-3 {
          0% { transform: translate(260px, 320px); }
          30% { transform: translate(120px, 180px); }
          60% { transform: translate(780px, 200px); }
          85% { transform: translate(620px, 340px); }
          100% { transform: translate(260px, 320px); }
        }
      `}</style>
    </div>
  )
}

// --- Monument ------------------------------------------------------------

interface MonumentProps {
  /** Center X of the monument base. */
  x: number
  /** Y position of the ground line. */
  groundY: number
}

function Monument({ x, groundY }: MonumentProps) {
  return (
    <g transform={`translate(${x} ${groundY})`}>
      {/* Stepped plinth */}
      <rect
        x="-90"
        y="-40"
        width="180"
        height="40"
        fill="color-mix(in srgb, var(--primary) 35%, var(--background))"
      />
      <rect
        x="-72"
        y="-60"
        width="144"
        height="20"
        fill="color-mix(in srgb, var(--primary) 50%, var(--background))"
      />
      <rect
        x="-56"
        y="-78"
        width="112"
        height="18"
        fill="color-mix(in srgb, var(--primary) 65%, var(--background))"
      />

      {/* Pillars */}
      <rect x="-42" y="-160" width="12" height="82" fill="var(--primary)" />
      <rect x="30" y="-160" width="12" height="82" fill="var(--primary)" />

      {/* Arch lintel */}
      <path
        d="M -50 -160 Q 0 -195, 50 -160 L 50 -150 Q 0 -185, -50 -150 Z"
        fill="var(--primary)"
      />

      {/* Tiny step inside arch */}
      <rect x="-28" y="-85" width="56" height="8" fill="color-mix(in srgb, var(--primary) 50%, var(--background))" />

      {/* Soft inner shadow inside arch */}
      <path
        d="M -30 -160 Q 0 -188, 30 -160 L 30 -85 L -30 -85 Z"
        fill="color-mix(in srgb, var(--primary) 22%, var(--background))"
        opacity="0.85"
      />
    </g>
  )
}

// --- Flower ---------------------------------------------------------------

interface FlowerSpot {
  x: number
  y: number
  type: 0 | 1 | 2 | 3
  scale: number
  colorIdx: number
}

// 18 deterministic positions, ordered front-first so the garden looks full
// even at low growth. Path zone (x ≈ 420–580) is avoided.
const FLOWER_SPOTS: FlowerSpot[] = [
  { x: 250, y: 470, type: 0, scale: 1.15, colorIdx: 0 },
  { x: 750, y: 470, type: 2, scale: 1.15, colorIdx: 1 },
  { x: 320, y: 450, type: 1, scale: 1.0, colorIdx: 2 },
  { x: 680, y: 450, type: 3, scale: 1.0, colorIdx: 3 },
  { x: 160, y: 480, type: 3, scale: 1.05, colorIdx: 4 },
  { x: 840, y: 480, type: 1, scale: 1.05, colorIdx: 0 },
  { x: 380, y: 425, type: 0, scale: 0.88, colorIdx: 4 },
  { x: 620, y: 425, type: 2, scale: 0.88, colorIdx: 1 },
  { x: 220, y: 442, type: 1, scale: 0.9, colorIdx: 2 },
  { x: 780, y: 442, type: 0, scale: 0.9, colorIdx: 3 },
  { x: 90, y: 460, type: 0, scale: 0.92, colorIdx: 4 },
  { x: 910, y: 460, type: 2, scale: 0.92, colorIdx: 2 },
  { x: 280, y: 410, type: 2, scale: 0.78, colorIdx: 0 },
  { x: 720, y: 410, type: 3, scale: 0.78, colorIdx: 4 },
  { x: 360, y: 395, type: 1, scale: 0.7, colorIdx: 3 },
  { x: 640, y: 395, type: 1, scale: 0.7, colorIdx: 2 },
  { x: 200, y: 400, type: 3, scale: 0.7, colorIdx: 1 },
  { x: 800, y: 400, type: 0, scale: 0.7, colorIdx: 0 },
]

const FLOWER_COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "color-mix(in srgb, var(--primary) 55%, white)",
  "#e3c47a", // honey, fixed so palette doesn't drain it
  "color-mix(in srgb, var(--secondary) 55%, white)",
]

interface FlowerProps {
  x: number
  y: number
  type: 0 | 1 | 2 | 3
  scale: number
  color: string
}

function Flower({ x, y, type, scale, color }: FlowerProps) {
  const stemColor = "color-mix(in srgb, var(--accent) 75%, black)"
  const stemHeight = 36

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <line
        x1="0"
        y1="0"
        x2="0"
        y2={-stemHeight}
        stroke={stemColor}
        strokeWidth={2.4}
        strokeLinecap="round"
        opacity={0.85}
      />
      <g transform={`translate(0, ${-stemHeight})`}>
        {type === 0 && <Tulip color={color} />}
        {type === 1 && <Daisy color={color} />}
        {type === 2 && <Cluster color={color} />}
        {type === 3 && <Round color={color} />}
      </g>
      {/* A leaf */}
      <path
        d={`M 0 -${stemHeight * 0.45} Q 7 -${stemHeight * 0.55}, 6 -${stemHeight * 0.35} Q 2 -${stemHeight * 0.4}, 0 -${stemHeight * 0.45} Z`}
        fill={stemColor}
        opacity={0.7}
      />
    </g>
  )
}

function Tulip({ color }: { color: string }) {
  return (
    <>
      <path
        d="M -8 0 Q -11 -16, 0 -16 Q 11 -16, 8 0 Z"
        fill={color}
      />
      <path
        d="M -3 -2 Q -4 -14, 0 -14 Q 4 -14, 3 -2 Z"
        fill="color-mix(in srgb, currentColor 0%, white 0%)"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.5"
        opacity={0.4}
      />
    </>
  )
}

function Daisy({ color }: { color: string }) {
  return (
    <>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          rx={3.5}
          ry={7}
          fill={color}
          transform={`rotate(${deg}) translate(0 -7)`}
        />
      ))}
      <circle r={3.2} fill="color-mix(in srgb, var(--secondary) 70%, black)" />
    </>
  )
}

function Cluster({ color }: { color: string }) {
  return (
    <>
      <circle cx={-4} cy={-1} r={4.2} fill={color} />
      <circle cx={4} cy={-1} r={4.2} fill={color} />
      <circle cx={0} cy={-7} r={4.5} fill={color} />
      <circle cx={0} cy={3} r={4} fill={color} opacity={0.85} />
    </>
  )
}

function Round({ color }: { color: string }) {
  return (
    <>
      <circle r={7} fill={color} />
      <circle r={3} fill="color-mix(in srgb, var(--secondary) 60%, white)" />
    </>
  )
}

// --- Bee -----------------------------------------------------------------

function Bee({ pathIdx }: { pathIdx: number }) {
  return (
    <g className={`garden-bee-${pathIdx}`}>
      <g>
        {/* Wings — behind body */}
        <g className="garden-bee-wings">
          <ellipse cx={-3} cy={-4} rx={4.5} ry={2.5} fill="white" opacity={0.7} />
          <ellipse cx={3} cy={-4} rx={4.5} ry={2.5} fill="white" opacity={0.7} />
        </g>
        {/* Body */}
        <ellipse rx={6.5} ry={4} fill="#2a1929" />
        {/* Stripes */}
        <rect x={-4.5} y={-3} width={2} height={6} fill="#e3c47a" />
        <rect x={-0.5} y={-3} width={2} height={6} fill="#e3c47a" />
        <rect x={3.5} y={-3} width={1.5} height={5} fill="#e3c47a" />
      </g>
    </g>
  )
}

// --- Stat card -----------------------------------------------------------

interface StatCardProps {
  icon: typeof Feather
  label: string
  value: number
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-4 py-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/55">
          {label}
        </span>
      </div>
      <p className="font-display text-3xl md:text-4xl tracking-[0.04em] text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}
