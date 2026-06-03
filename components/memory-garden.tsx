"use client"

import { useEffect, useMemo, useState } from "react"
import { Feather, Flower2, Sparkles, Target } from "lucide-react"
import {
  beeCountFor,
  buildGardenItems,
  computeGardenStats,
  houseStageFor,
  ITEM_EYEBROW,
  phaseFor,
  type GardenItem,
  type GardenStats,
} from "@/lib/data/garden-state"
import { startMusic, stopMusic, onMusicLoadState } from "@/lib/audio/engine"
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
  const [items, setItems] = useState<GardenItem[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [musicLoaded, setMusicLoaded] = useState<boolean | null>(null)
  const { enabled: audioEnabled } = useAudio()

  // Compute after mount — keeps SSR and CSR markup consistent.
  useEffect(() => {
    setStats(computeGardenStats())
    setItems(buildGardenItems())
  }, [])

  // Start/stop the music with the page and the audio toggle.
  useEffect(() => {
    if (audioEnabled) {
      startMusic()
    }
    return () => {
      stopMusic()
    }
  }, [audioEnabled])

  // Watch the music load state so we can show a hint if the file isn't there.
  useEffect(() => {
    if (!audioEnabled) {
      setMusicLoaded(null)
      return
    }
    const unsub = onMusicLoadState((loaded) => setMusicLoaded(loaded))
    return unsub
  }, [audioEnabled])

  const ready = stats !== null
  const tokens = stats?.tokens ?? 0
  const phase = phaseFor(tokens)
  const beeCount = beeCountFor(tokens)
  const houseStage = houseStageFor(tokens)

  // Pair each item with a flower spot (front-first), capped at spot count.
  // Render back-to-front so closer blooms layer on top. Stable keys via item id.
  const placedItems = useMemo(() => {
    return items.slice(0, FLOWER_SPOTS.length).map((item, idx) => ({
      item,
      spot: FLOWER_SPOTS[idx],
    }))
  }, [items])

  const renderedItems = useMemo(() => {
    return [...placedItems].sort((a, b) => a.spot.y - b.spot.y)
  }, [placedItems])

  const hoveredEntry = hoveredId
    ? placedItems.find((p) => p.item.id === hoveredId)
    : null

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
          onClick={() => setHoveredId(null)}
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

          {/* House — the inner foundation, growing with you */}
          <House x={500} groundY={400} stage={houseStage} />

          {/* Stone path — narrow trapezoid from the door to the foreground */}
          <path
            d="M 475 370 L 525 370 L 600 500 L 400 500 Z"
            fill="url(#path-gradient)"
            opacity="0.9"
          />
          {/* Path tile lines for texture */}
          {[0, 1, 2, 3].map((i) => {
            const t = (i + 1) / 5
            const left = 475 + (400 - 475) * t
            const right = 525 + (600 - 525) * t
            const y = 370 + (500 - 370) * t
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

          {/* Flowers — each one is a real item from the rest of the app.
              Hover (desktop) or tap (mobile) reveals what it represents. */}
          {renderedItems.map(({ item, spot }) => {
            // Items can override the spot's default flower type when they have
            // their own semantic (e.g. completed projects always render as
            // tulips). Otherwise, fall back to the spot's deterministic type.
            const flowerType = item.flowerType
            const scale = spot.scale * item.scale
            const isHovered = hoveredId === item.id
            return (
              <g
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation()
                  setHoveredId((prev) => (prev === item.id ? null : item.id))
                }}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={`${ITEM_EYEBROW[item.type]}: ${item.title}`}
              >
                <Flower
                  x={spot.x}
                  y={spot.y}
                  type={flowerType}
                  scale={scale}
                  color={item.tint}
                  highlighted={isHovered}
                />
              </g>
            )
          })}

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

        {/* ─── Hover/tap tooltip ─── */}
        {hoveredEntry && (
          <FlowerTooltip
            item={hoveredEntry.item}
            spot={hoveredEntry.spot}
          />
        )}
      </div>

      {/* ─── Whisper + phase ─── */}
      <div className="mt-6 md:mt-8 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/55 mb-2">
          {ready ? phase.name : "Loading"}
        </p>
        <p className="font-serif italic text-xl md:text-2xl text-foreground/85 max-w-xl mx-auto">
          {ready ? phase.whisper : "…"}
        </p>
        {ready && placedItems.length > 0 && (
          <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-foreground/35">
            Hover or tap a bloom
          </p>
        )}
      </div>

      {/* ─── Music hint (only when audio is on and the file isn't loaded) ─── */}
      {audioEnabled && musicLoaded === false && (
        <div className="mt-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-5 py-4 text-sm text-foreground/75">
          <p className="font-serif italic">
            Music is on but no audio file is loaded. See{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted/60 text-xs">public/audio/README.md</code>{" "}
            for where to drop your Vivaldi mp3.
          </p>
        </div>
      )}

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

      {/* Local styles for bees + wings + chimney smoke.
          (Flower sway was here but caused a CSS-vs-SVG transform clash
          that made each flower jump to (0,0) at the peak of every cycle.
          Removed for stability; bees provide the scene's motion.) */}
      <style jsx>{`
        :global(.house-smoke) {
          animation: house-smoke-rise 5.5s ease-out infinite;
        }
        :global(.house-smoke-0) {
          animation-delay: 0s;
        }
        :global(.house-smoke-1) {
          animation-delay: 1.9s;
        }
        :global(.house-smoke-2) {
          animation-delay: 3.7s;
        }
        @keyframes house-smoke-rise {
          0% {
            transform: translate(0px, 0px);
            opacity: 0;
          }
          12% {
            opacity: 0.55;
          }
          70% {
            opacity: 0.32;
          }
          100% {
            transform: translate(14px, -60px);
            opacity: 0;
          }
        }
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

// --- Tooltip overlay ----------------------------------------------------

interface FlowerTooltipProps {
  item: GardenItem
  spot: FlowerSpot
}

function FlowerTooltip({ item, spot }: FlowerTooltipProps) {
  // Tooltip anchors just above the bloom (≈ spot.y - 36 in SVG coords).
  // Clamp horizontally so it doesn't run off the rounded card edges.
  const xPct = (spot.x / 1000) * 100
  const yPct = ((spot.y - 36) / 500) * 100
  const clampedX = Math.max(14, Math.min(86, xPct))
  return (
    <div
      className="pointer-events-none absolute z-10 animate-in fade-in slide-in-from-bottom-1 duration-150"
      style={{
        left: `${clampedX}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, calc(-100% - 12px))",
      }}
    >
      <div className="rounded-xl bg-background/95 backdrop-blur-sm border border-border shadow-lg px-3.5 py-2.5 max-w-[240px]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: item.tint.startsWith("var(") ? "var(--primary)" : item.tint,
            }}
            aria-hidden
          />
          <span className="text-[9px] tracking-[0.3em] uppercase text-foreground/55">
            {item.subtitle}
          </span>
        </div>
        <p className="font-serif text-base text-foreground leading-snug">
          {item.title}
        </p>
      </div>
      {/* Tiny pointer triangle */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-background/95 border-r border-b border-border"
      />
    </div>
  )
}

// --- House ---------------------------------------------------------------

interface HouseProps {
  /** Center X of the house base. */
  x: number
  /** Y position of the ground line. */
  groundY: number
  /** 0–5 — how much of the house has been built. */
  stage: number
}

/**
 * The inner-foundation house. Drawn additively across six stages so
 * earlier detail never disappears. Every fill is palette-bound except
 * the honey-warm windows, which stay golden regardless of palette —
 * the windows are the lit life inside.
 */
function House({ x, groundY, stage }: HouseProps) {
  const wall = "color-mix(in srgb, var(--background) 88%, white)"
  const wallShadow = "color-mix(in srgb, var(--accent) 30%, var(--background))"
  const stone = "color-mix(in srgb, var(--accent) 52%, var(--background))"
  const stoneDark = "color-mix(in srgb, var(--accent) 75%, var(--background))"
  const roof = "color-mix(in srgb, var(--primary) 78%, var(--background))"
  const roofShadow = "color-mix(in srgb, var(--primary) 55%, black)"
  const door = "var(--primary)"
  const doorDark = "color-mix(in srgb, var(--primary) 70%, black)"
  const windowFrame = "color-mix(in srgb, var(--primary) 55%, var(--background))"
  const windowGlow = "#e3c47a" // honey, fixed
  const chimney = "color-mix(in srgb, var(--accent) 60%, var(--background))"
  const vine = "color-mix(in srgb, var(--accent) 85%, black)"

  return (
    <g transform={`translate(${x} ${groundY})`}>
      {/* Stage 0 — foundation (always shown) */}
      <rect x="-120" y="-22" width="240" height="22" fill={stone} />
      <rect x="-108" y="-36" width="216" height="14" fill={stoneDark} />

      {/* Stage 1 — low walls + door frame */}
      {stage >= 1 && (
        <>
          <rect x="-92" y="-104" width="184" height="68" fill={wall} />
          {/* Base shadow band where walls meet stone */}
          <rect x="-92" y="-44" width="184" height="8" fill={wallShadow} opacity="0.45" />
          {/* Door frame — taller cutout */}
          <rect x="-21" y="-90" width="42" height="54" fill={stoneDark} />
        </>
      )}

      {/* Stage 2 — full walls + door + knob */}
      {stage >= 2 && (
        <>
          {/* Upper walls extending toward roof line */}
          <rect x="-92" y="-168" width="184" height="64" fill={wall} />
          {/* Crown moulding line at top */}
          <rect x="-94" y="-168" width="188" height="3" fill={wallShadow} opacity="0.5" />
          {/* Door (recessed inside frame) */}
          <rect x="-15" y="-86" width="30" height="50" fill={door} />
          {/* Door knob */}
          <circle cx="10" cy="-60" r="1.8" fill={doorDark} />
          {/* Horizontal trim across walls */}
          <line
            x1="-92"
            y1="-104"
            x2="92"
            y2="-104"
            stroke={wallShadow}
            strokeWidth="1.4"
            opacity="0.55"
          />
        </>
      )}

      {/* Stage 3 — roof */}
      {stage >= 3 && (
        <>
          <path d="M -102 -168 L 0 -230 L 102 -168 Z" fill={roof} />
          {/* Roof underline / overhang */}
          <rect x="-106" y="-168" width="212" height="5" fill={roofShadow} />
          {/* Subtle right-side roof shadow */}
          <path
            d="M 0 -230 L 102 -168 L 80 -168 L 0 -220 Z"
            fill={roofShadow}
            opacity="0.32"
          />
        </>
      )}

      {/* Stage 4 — chimney + first window */}
      {stage >= 4 && (
        <>
          {/* Chimney */}
          <rect x="-60" y="-232" width="16" height="68" fill={chimney} />
          {/* Chimney cap */}
          <rect x="-64" y="-236" width="24" height="6" fill={stoneDark} />
          {/* Left window */}
          <circle cx="-46" cy="-130" r="13" fill={windowFrame} />
          <circle cx="-46" cy="-130" r="10" fill={windowGlow} />
          {/* Window cross */}
          <line
            x1="-56"
            y1="-130"
            x2="-36"
            y2="-130"
            stroke={windowFrame}
            strokeWidth="1.5"
          />
          <line
            x1="-46"
            y1="-140"
            x2="-46"
            y2="-120"
            stroke={windowFrame}
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Stage 5 — smoke + right window + vines */}
      {stage >= 5 && (
        <>
          {/* Smoke puffs above the chimney, animated */}
          <g transform="translate(-52, -236)">
            <ellipse
              className="house-smoke house-smoke-0"
              cx={0}
              cy={0}
              rx={8}
              ry={6}
              fill="white"
              opacity={0}
            />
            <ellipse
              className="house-smoke house-smoke-1"
              cx={0}
              cy={0}
              rx={9}
              ry={6.5}
              fill="white"
              opacity={0}
            />
            <ellipse
              className="house-smoke house-smoke-2"
              cx={0}
              cy={0}
              rx={10}
              ry={7}
              fill="white"
              opacity={0}
            />
          </g>
          {/* Right window */}
          <circle cx="46" cy="-130" r="13" fill={windowFrame} />
          <circle cx="46" cy="-130" r="10" fill={windowGlow} />
          <line x1="36" y1="-130" x2="56" y2="-130" stroke={windowFrame} strokeWidth="1.5" />
          <line x1="46" y1="-140" x2="46" y2="-120" stroke={windowFrame} strokeWidth="1.5" />
          {/* Vines along the wall base */}
          <g opacity={0.75}>
            {[
              [-82, -52, 3],
              [-74, -62, 2.5],
              [-86, -68, 2],
              [-78, -78, 2.5],
              [82, -54, 3],
              [74, -64, 2.5],
              [86, -72, 2],
              [78, -82, 2.5],
            ].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill={vine} />
            ))}
          </g>
          {/* Front-door wreath hint — a tiny leaf above the door */}
          <ellipse cx="0" cy="-91" rx="6" ry="2" fill={vine} opacity={0.8} />
        </>
      )}

      {/* Stage 6 — window boxes with tiny flowers under both windows */}
      {stage >= 6 && (
        <>
          {/* Left box */}
          <rect x="-60" y="-118" width="28" height="7" fill={stoneDark} />
          <rect x="-60" y="-119" width="28" height="2" fill={stone} />
          <circle cx="-54" cy="-122" r="2.4" fill="#d84565" />
          <circle cx="-46" cy="-123" r="2.6" fill="#e8a13a" />
          <circle cx="-38" cy="-122" r="2.4" fill="#b59bc8" />
          {/* Right box */}
          <rect x="32" y="-118" width="28" height="7" fill={stoneDark} />
          <rect x="32" y="-119" width="28" height="2" fill={stone} />
          <circle cx="38" cy="-122" r="2.4" fill="#e3c47a" />
          <circle cx="46" cy="-123" r="2.6" fill="#d84565" />
          <circle cx="54" cy="-122" r="2.4" fill="#7c9468" />
        </>
      )}

      {/* Stage 7 — apple tree, bird on chimney, welcome step */}
      {stage >= 7 && (
        <>
          {/* Welcome step at the door */}
          <rect x="-22" y="-32" width="44" height="6" fill={stoneDark} />
          <rect x="-22" y="-33" width="44" height="1.5" fill={stone} />

          {/* Apple tree, off to the right of the house */}
          <g transform="translate(250, 0)">
            {/* Trunk */}
            <rect x={-5} y={-50} width={10} height={50} fill="#5b3e2f" />
            {/* Canopy — three overlapping circles for soft cottagey shape */}
            <circle cx={-18} cy={-65} r={28} fill="#6a8a55" />
            <circle cx={18} cy={-65} r={28} fill="#6a8a55" />
            <circle cx={0} cy={-82} r={32} fill="#7c9468" />
            <circle cx={0} cy={-60} r={26} fill="#7c9468" opacity={0.6} />
            {/* Apples */}
            {[
              [-14, -70],
              [12, -78],
              [-4, -90],
              [18, -58],
              [-22, -55],
              [6, -54],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={3} fill="#d84565" />
            ))}
            {/* Subtle shadow under tree */}
            <ellipse cx={0} cy={2} rx={28} ry={3} fill="#2a1929" opacity={0.18} />
          </g>

          {/* Bird perched on chimney cap */}
          <g transform="translate(-52, -242)">
            <ellipse cx={0} cy={0} rx={5.5} ry={3.5} fill="#2a1929" />
            <path d="M 4 -2 L 8 -3 L 6 0 Z" fill="#2a1929" />
            <circle cx={5} cy={-2.5} r={0.6} fill="#e3c47a" />
            {/* tiny tail */}
            <path d="M -5 -1 L -9 -3 L -6 1 Z" fill="#2a1929" />
          </g>
        </>
      )}

      {/* Stage 8 — door lantern + path lantern + climbing roses */}
      {stage >= 8 && (
        <>
          {/* Wall-mounted lantern beside the door */}
          <g transform="translate(28, -86)">
            <rect x={-1} y={0} width={2} height={6} fill={stoneDark} />
            <rect x={-5} y={6} width={10} height={12} fill={stoneDark} />
            <circle cx={0} cy={12} r={3.5} fill="#e3c47a" />
            {/* Glow halo */}
            <circle cx={0} cy={12} r={9} fill="#e3c47a" opacity={0.28} />
            <circle cx={0} cy={12} r={16} fill="#e3c47a" opacity={0.12} />
          </g>

          {/* Path lantern out front */}
          <g transform="translate(-138, 78)">
            <line x1={0} y1={0} x2={0} y2={-30} stroke={stoneDark} strokeWidth={2} />
            <rect x={-5} y={-40} width={10} height={12} fill={stoneDark} />
            <circle cx={0} cy={-34} r={3} fill="#e3c47a" />
            <circle cx={0} cy={-34} r={8} fill="#e3c47a" opacity={0.3} />
            <circle cx={0} cy={-34} r={14} fill="#e3c47a" opacity={0.12} />
          </g>

          {/* Climbing roses — pink + red dots layered up the walls */}
          <g opacity={0.9}>
            {[
              [-86, -100, 3.5, "#d84565"],
              [-80, -110, 3, "#e8b4b8"],
              [-88, -120, 2.5, "#d84565"],
              [-82, -132, 3, "#a83648"],
              [-86, -145, 2.5, "#e8b4b8"],
              [-78, -158, 3, "#d84565"],
              [86, -102, 3.5, "#d84565"],
              [80, -112, 3, "#e8b4b8"],
              [88, -122, 2.5, "#a83648"],
              [82, -134, 3, "#d84565"],
              [86, -147, 2.5, "#e8b4b8"],
              [78, -158, 3, "#a83648"],
            ].map(([cx, cy, r, c], i) => (
              <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={c as string} />
            ))}
          </g>
        </>
      )}
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

// 18 deterministic positions that wrap around the house and the front path.
// The house footprint sits between x≈380 and x≈620; the path widens from
// the door to the foreground edges. Flowers stay clear of both and fan out
// on either side, with the boldest blooms framing the path entrance.
const FLOWER_SPOTS: FlowerSpot[] = [
  // Front row, biggest blooms framing the path mouth
  { x: 340, y: 470, type: 0, scale: 1.15, colorIdx: 0 },
  { x: 660, y: 470, type: 2, scale: 1.15, colorIdx: 1 },
  // Front mid
  { x: 270, y: 455, type: 1, scale: 1.0, colorIdx: 2 },
  { x: 730, y: 455, type: 3, scale: 1.0, colorIdx: 3 },
  // Outer front
  { x: 130, y: 480, type: 3, scale: 1.05, colorIdx: 4 },
  { x: 870, y: 480, type: 1, scale: 1.05, colorIdx: 0 },
  // Closer to the house corners
  { x: 200, y: 440, type: 0, scale: 0.95, colorIdx: 4 },
  { x: 800, y: 440, type: 2, scale: 0.95, colorIdx: 1 },
  // Outer middle
  { x: 70, y: 460, type: 1, scale: 0.92, colorIdx: 2 },
  { x: 930, y: 460, type: 0, scale: 0.92, colorIdx: 3 },
  // Back row alongside house corners
  { x: 250, y: 420, type: 2, scale: 0.78, colorIdx: 1 },
  { x: 750, y: 420, type: 3, scale: 0.78, colorIdx: 4 },
  // Outer back
  { x: 150, y: 425, type: 1, scale: 0.75, colorIdx: 0 },
  { x: 850, y: 425, type: 1, scale: 0.75, colorIdx: 2 },
  // Far back small
  { x: 100, y: 410, type: 3, scale: 0.65, colorIdx: 3 },
  { x: 900, y: 410, type: 0, scale: 0.65, colorIdx: 4 },
  // Inner front fillers, well clear of the path edge
  { x: 310, y: 485, type: 1, scale: 0.85, colorIdx: 3 },
  { x: 690, y: 485, type: 2, scale: 0.85, colorIdx: 0 },
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
  type: 0 | 1 | 2 | 3 | 4
  scale: number
  color: string
  /** When true, a soft glow ring renders behind the bloom (hover state). */
  highlighted?: boolean
}

function Flower({ x, y, type, scale, color, highlighted }: FlowerProps) {
  const stemColor = "color-mix(in srgb, var(--accent) 75%, black)"
  // Sprouts have a slightly shorter stem so the bud sits lower — they read
  // as not-yet-bloomed rather than as small flowers.
  const stemHeight = type === 4 ? 24 : 36

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Hover glow halo behind the head */}
      {highlighted && (
        <circle
          cx={0}
          cy={-stemHeight}
          r={18}
          fill={color}
          opacity={0.25}
        />
      )}
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
        {type === 4 && <Sprout color={color} />}
      </g>
      {/* A leaf — sprouts get a smaller leaf and an extra one for greenery */}
      <path
        d={`M 0 -${stemHeight * 0.45} Q 7 -${stemHeight * 0.55}, 6 -${stemHeight * 0.35} Q 2 -${stemHeight * 0.4}, 0 -${stemHeight * 0.45} Z`}
        fill={stemColor}
        opacity={0.7}
      />
      {type === 4 && (
        <path
          d={`M 0 -${stemHeight * 0.7} Q -7 -${stemHeight * 0.8}, -6 -${stemHeight * 0.6} Q -2 -${stemHeight * 0.65}, 0 -${stemHeight * 0.7} Z`}
          fill={stemColor}
          opacity={0.7}
        />
      )}
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

// A closed bud / sprout — used for active projects ("tending"), promises of
// future blooms. Tighter and smaller than the open flower forms.
function Sprout({ color }: { color: string }) {
  return (
    <>
      <path
        d="M -4 0 Q -5 -10, 0 -10 Q 5 -10, 4 0 Z"
        fill={color}
        opacity={0.9}
      />
      <path
        d="M -2 -1 Q -2.5 -8, 0 -8 Q 2.5 -8, 2 -1 Z"
        fill="color-mix(in srgb, var(--background) 35%, transparent)"
        opacity={0.5}
      />
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
