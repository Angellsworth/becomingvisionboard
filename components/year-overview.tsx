"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ImageIcon } from "lucide-react"
import { useYear } from "@/components/year-provider"
import { keys } from "@/lib/year"

interface CollageImage {
  id: string
  url: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
}

interface MonthData {
  slug: string
  name: string
  images: CollageImage[]
  direction: string
  practicesCount: number
  color: string
}

const MONTHS = [
  { name: "January", slug: "january", color: "lyons-blue" },
  { name: "February", slug: "february", color: "damson" },
  { name: "March", slug: "march", color: "primrose-pink" },
  { name: "April", slug: "april", color: "lemon-grass" },
  { name: "May", slug: "may", color: "branded-melon" },
  { name: "June", slug: "june", color: "winterberry" },
  { name: "July", slug: "july", color: "poppy-red" },
  { name: "August", slug: "august", color: "chili-oil" },
  { name: "September", slug: "september", color: "bronze-brown" },
  { name: "October", slug: "october", color: "hot-chocolate" },
  { name: "November", slug: "november", color: "damson" },
  { name: "December", slug: "december", color: "lyons-blue" },
]

export function YearOverview() {
  const { year, ready } = useYear()
  const [monthsData, setMonthsData] = useState<MonthData[]>([])

  useEffect(() => {
    if (!ready) return
    // Load data from localStorage for all months of the selected year
    const data = MONTHS.map((month) => {
      const imagesStr = localStorage.getItem(keys.monthlyCollage(month.slug, year))
      const direction = localStorage.getItem(keys.direction(month.slug, year)) || ""
      const practicesStr = localStorage.getItem(keys.practices(month.slug, year))

      let images: CollageImage[] = []
      try {
        images = imagesStr ? JSON.parse(imagesStr) : []
      } catch {
        images = []
      }
      let practices: unknown[] = []
      try {
        practices = practicesStr ? JSON.parse(practicesStr) : []
      } catch {
        practices = []
      }

      return {
        slug: month.slug,
        name: month.name,
        images,
        direction,
        practicesCount: practices.length,
        color: month.color,
      }
    })

    setMonthsData(data)
  }, [year, ready])

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper via-lemon-grass/10 to-primrose-pink/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-ink mb-4">
            Year Overview <span className="text-bronze-brown">{year}</span>
          </h1>
          <p className="text-bronze-brown text-lg">The evolution of your becoming</p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {monthsData.map((month) => (
            <MonthCard key={month.slug} month={month} />
          ))}
        </div>

        {/* Year Summary */}
        <div className="mt-16 text-center bg-card/30 backdrop-blur-sm rounded-lg p-12 border border-bronze-brown/10">
          <h2 className="font-serif text-4xl font-light text-ink mb-4">A Year of Becoming</h2>
          <div className="flex flex-wrap justify-center gap-8 text-bronze-brown">
            <div>
              <p className="text-3xl font-serif text-ink">{monthsData.reduce((sum, m) => sum + m.images.length, 0)}</p>
              <p className="text-sm">Total Images</p>
            </div>
            <div>
              <p className="text-3xl font-serif text-ink">{monthsData.filter((m) => m.direction.length > 0).length}</p>
              <p className="text-sm">Months with Direction</p>
            </div>
            <div>
              <p className="text-3xl font-serif text-ink">{monthsData.reduce((sum, m) => sum + m.practicesCount, 0)}</p>
              <p className="text-sm">Total Practices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MonthCardProps {
  month: MonthData
}

function MonthCard({ month }: MonthCardProps) {
  const hasContent = month.images.length > 0 || month.direction.length > 0 || month.practicesCount > 0

  return (
    <Link
      href={`/months/${month.slug}`}
      className="group block bg-card rounded-lg overflow-hidden border border-bronze-brown/10 hover:border-branded-melon/30 transition-all hover:shadow-lg"
    >
      {/* Collage Preview */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-primrose-pink/20 via-paper to-lemon-grass/20 overflow-hidden">
        {month.images.length > 0 ? (
          <div className="absolute inset-0">
            {month.images.slice(0, 5).map((image) => (
              <div
                key={image.id}
                className="absolute"
                style={{
                  left: `${image.x}%`,
                  top: `${image.y}%`,
                  width: `${image.width}%`,
                  height: `${image.height}%`,
                  transform: `rotate(${image.rotation}deg)`,
                  zIndex: image.zIndex,
                }}
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`${month.name} collage`}
                  className="w-full h-full object-cover rounded-sm shadow-md"
                />
              </div>
            ))}
            {month.images.length > 5 && (
              <div className="absolute bottom-2 right-2 bg-bronze-brown/80 text-paper px-2 py-1 rounded text-xs">
                +{month.images.length - 5} more
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-bronze-brown/30">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Month Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-2xl text-ink">{month.name}</h3>
          <ArrowRight className="w-5 h-5 text-bronze-brown group-hover:text-branded-melon group-hover:translate-x-1 transition-all" />
        </div>

        {hasContent ? (
          <div className="space-y-2 text-sm text-bronze-brown">
            {month.direction && (
              <p className="line-clamp-2 italic text-ink/70">
                "{month.direction.length > 80 ? `${month.direction.substring(0, 80)}...` : month.direction}"
              </p>
            )}
            <div className="flex gap-4 text-xs">
              <span>{month.images.length} images</span>
              <span>{month.practicesCount} practices</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-bronze-brown/50 italic">Not started yet</p>
        )}
      </div>
    </Link>
  )
}
