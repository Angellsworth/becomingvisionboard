import { Navigation } from "@/components/navigation"
import { YearOverview } from "@/components/year-overview"

export default function YearOverviewPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <YearOverview />
      </main>
    </>
  )
}
