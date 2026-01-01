import { Navigation } from "@/components/navigation"
import { MonthlyView } from "@/components/monthly-view"

export default async function MonthPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <MonthlyView month={month} />
      </main>
    </>
  )
}
