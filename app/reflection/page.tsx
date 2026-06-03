import { Feather } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { SectionPlaceholder } from "@/components/section-placeholder"

export default function ReflectionPage() {
  return (
    <AppShell>
      <SectionPlaceholder
        icon={Feather}
        eyebrow="Phase Seven"
        title="Reflection"
        description="An unhurried place to think on the page. Prompts that meet you where you are, and a timeline of entries you can return to like letters from past selves."
        features={[
          "Daily prompts: What am I becoming? What did I learn today? What am I letting go of? What made me feel alive?",
          "Open entries when the prompts don't fit.",
          "Your monthly reflections fold in here as a timeline.",
          "Each entry quietly waters the Memory Garden.",
        ]}
      />
    </AppShell>
  )
}
