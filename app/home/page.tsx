import { Navigation } from "@/components/navigation"
import { AnnualCollage } from "@/components/annual-collage"

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <AnnualCollage />
      </main>
    </>
  )
}
