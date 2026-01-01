"use client"
import { MonthlyCollage } from "./monthly-collage"
import { BecomingDirection } from "./becoming-direction"
import { BecomingPractices } from "./becoming-practices"
import { MonthlyReflection } from "./monthly-reflection"

interface MonthlyViewProps {
  month: string
}

export function MonthlyView({ month }: MonthlyViewProps) {
  const monthName = month.charAt(0).toUpperCase() + month.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper via-primrose-pink/10 to-lemon-grass/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Month Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-ink mb-2">{monthName}</h1>
          <p className="text-bronze-brown text-lg">2026</p>
        </div>

        {/* Monthly Collage */}
        <section className="mb-16">
          <MonthlyCollage month={month} />
        </section>

        {/* Becoming Direction */}
        <section className="mb-16">
          <BecomingDirection month={month} />
        </section>

        {/* Becoming Practices */}
        <section className="mb-16">
          <BecomingPractices month={month} />
        </section>

        {/* Reflection */}
        <section className="mb-16">
          <MonthlyReflection month={month} />
        </section>
      </div>
    </div>
  )
}
