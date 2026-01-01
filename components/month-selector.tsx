"use client"

import Link from "next/link"
import { Calendar } from "lucide-react"

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

export function MonthSelector() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl sm:text-6xl font-light text-ink mb-4">Monthly Becoming</h1>
        <p className="text-bronze-brown text-lg">Choose a month to begin</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTHS.map((month) => (
          <Link
            key={month.slug}
            href={`/months/${month.slug}`}
            className="group relative p-6 rounded-lg bg-card border border-bronze-brown/10 hover:border-branded-melon/30 transition-all hover:shadow-lg"
          >
            <div className="flex flex-col items-center gap-3">
              <Calendar className="w-8 h-8 text-bronze-brown group-hover:text-branded-melon transition-colors" />
              <span className="font-serif text-xl text-ink">{month.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
