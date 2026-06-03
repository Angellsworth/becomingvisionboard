import { Flower2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { SectionPlaceholder } from "@/components/section-placeholder"

export default function GardenPage() {
  return (
    <AppShell>
      <SectionPlaceholder
        icon={Flower2}
        eyebrow="Phase Eight"
        title="Memory Garden"
        description="A small living scene that quietly tracks what you've tended. Every reflection waters something. Every finished project blooms. When you've been here long enough — bees."
        features={[
          "A hand-drawn garden that grows with you: seeds, sprouts, blooms.",
          "Reflections water the soil. Completed projects bloom into flowers.",
          "Bees arrive at milestones — a sacred symbol, a returning friend.",
          "Animated, gentle, never demanding. The opposite of a streak.",
        ]}
      />
    </AppShell>
  )
}
