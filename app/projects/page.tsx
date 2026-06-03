import { Target } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { SectionPlaceholder } from "@/components/section-placeholder"

export default function ProjectsPage() {
  return (
    <AppShell>
      <SectionPlaceholder
        icon={Target}
        eyebrow="Phase Six"
        title="Life Projects"
        description="The threads of your life held side by side — fitness, home, work, travel, money — each with quiet progress and a place to return."
        features={[
          "Progress bars that feel like watercolor, not a productivity app.",
          "Categories with their own colors: garden green for home, dusty rose for travel.",
          "Milestones tied to seasons rather than rigid deadlines.",
          "Your becoming practices migrate here as ongoing projects.",
        ]}
      />
    </AppShell>
  )
}
