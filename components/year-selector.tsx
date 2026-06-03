"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useYear } from "@/components/year-provider"
import { discoverYearsWithData } from "@/lib/year"

/**
 * Compact ‹ year › selector for the nav.
 *
 * - Defaults to the current year.
 * - Backward bound: earliest year with any saved data (or current year if none).
 * - Forward bound: current year + 1, so users can pre-plan next year.
 */
export function YearSelector() {
  const { year, currentYear, setYear, ready } = useYear()
  const [minYear, setMinYear] = useState(currentYear)

  useEffect(() => {
    if (!ready) return
    const years = discoverYearsWithData()
    setMinYear(Math.min(...years, currentYear))
  }, [ready, currentYear, year])

  const maxYear = currentYear + 1
  const canPrev = year > minYear
  const canNext = year < maxYear

  return (
    <div className="flex items-center gap-1 rounded-md border border-silver/40 bg-paper/60 px-1">
      <button
        type="button"
        onClick={() => canPrev && setYear(year - 1)}
        disabled={!canPrev}
        aria-label="Previous year"
        className={cn(
          "p-1 rounded transition-colors",
          canPrev ? "text-dusk-blue hover:bg-grape-soda/20" : "text-silver/50 cursor-not-allowed",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="font-serif text-base text-ink min-w-[3rem] text-center tabular-nums">{year}</span>
      <button
        type="button"
        onClick={() => canNext && setYear(year + 1)}
        disabled={!canNext}
        aria-label="Next year"
        className={cn(
          "p-1 rounded transition-colors",
          canNext ? "text-dusk-blue hover:bg-grape-soda/20" : "text-silver/50 cursor-not-allowed",
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
