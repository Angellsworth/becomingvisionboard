import { Navigation } from "@/components/navigation"
import { RotatingQuote } from "@/components/rotating-quote"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-6 py-24">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16">
            <h1 className="font-serif text-6xl md:text-7xl text-primary leading-tight text-balance">Becoming 2026</h1>
            <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed text-pretty max-w-2xl mx-auto">
              A gentle space to visualize your transformation through collages, baby steps, and reflection
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Button asChild size="lg" className="bg-pacific hover:bg-pacific/90 text-white">
                <Link href="/auth/sign-up">Begin Your Journey</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-dusk text-dusk hover:bg-dusk/10 bg-transparent"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Inspirational Quotes Section */}
          <RotatingQuote />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-pacific/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pacific" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-primary">Vision Collages</h3>
              <p className="text-muted leading-relaxed">
                Create organic, editorial-style collages for your year and each month. Drag, drop, and position images
                freely to visualize your transformation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-grape/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-grape" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-primary">Becoming Practices</h3>
              <p className="text-muted leading-relaxed">
                Track your baby steps without the pressure. No streaks, no percentages—just gentle visual feedback as
                you build your practices.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-dusk/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-dusk" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-primary">Monthly Reflections</h3>
              <p className="text-muted leading-relaxed">
                Define your becoming direction and reflect on your journey each month. Watch your year unfold in the
                overview timeline.
              </p>
            </div>
          </div>

          {/* Closing */}
          <div className="text-center mt-24 pt-12 border-t border-silver/20">
            <p className="text-lg text-muted/80 max-w-2xl mx-auto leading-relaxed">
              This is your space to become who you want to be in 2026. No pressure, no gamification—just you, your
              vision, and your baby steps forward.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
