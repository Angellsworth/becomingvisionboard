import { UserRound } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { SectionPlaceholder } from "@/components/section-placeholder"

export default function FutureSelfPage() {
  return (
    <AppShell>
      <SectionPlaceholder
        icon={UserRound}
        eyebrow="Phase Five"
        title="Future Self"
        description="A living portrait of the woman you are becoming — her values, her rituals, the way she holds her mornings, the language she uses about herself."
        features={[
          "Vision statement, written in your own voice, that travels with you across the year.",
          "Values, traits, and the routines that shape an unhurried life.",
          "Personal style notes: what you wear, the way your home smells, the way you move.",
          "Goals for the year, tied gently to seasons rather than dates.",
        ]}
      />
    </AppShell>
  )
}
