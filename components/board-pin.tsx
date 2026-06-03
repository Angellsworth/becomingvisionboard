"use client"

import { useState } from "react"
import { Pencil, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { SIZE_ASPECT, type BoardItem } from "@/lib/data/board-types"

interface BoardPinProps {
  item: BoardItem
  onEdit: () => void
}

export function BoardPin({ item, onEdit }: BoardPinProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="mb-3 md:mb-4 break-inside-avoid group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={onEdit}
        className="block w-full text-left rounded-2xl overflow-hidden border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
        style={{
          transform: `rotate(${item.rotation}deg) translateY(${hovered ? "-2px" : "0"})`,
          transformOrigin: "center",
        }}
      >
        <div className={cn("w-full overflow-hidden", SIZE_ASPECT[item.size])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.caption || "Pin"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            draggable={false}
          />
        </div>
        {item.caption && (
          <div className="px-3 py-2.5">
            <p className="font-serif italic text-sm leading-snug text-foreground/85 line-clamp-3">
              {item.caption}
            </p>
          </div>
        )}
      </button>

      {/* Edit affordance — appears on hover (desktop) or always on touch */}
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          "absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm text-foreground shadow-md border border-border flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity",
          "focus:opacity-100",
        )}
        aria-label="Edit pin"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* Optional outbound link tag */}
      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/85 backdrop-blur-sm text-foreground/80 text-[10px] border border-border hover:text-primary transition-colors"
          aria-label="Open link"
        >
          <ExternalLink className="w-3 h-3" />
          link
        </a>
      )}
    </article>
  )
}
