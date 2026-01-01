import { Navigation } from "@/components/navigation"
import { MonthSelector } from "@/components/month-selector"

export default function MonthsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-paper via-lemon-grass/10 to-primrose-pink/20">
        <MonthSelector />
      </main>
    </>
  )
}
