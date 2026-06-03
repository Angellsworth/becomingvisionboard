import { AppShell } from "@/components/app-shell"
import { AnnualCollage } from "@/components/annual-collage"

/**
 * Becoming Board — the Pinterest-style vision space.
 *
 * For now this still renders the existing annual collage component so
 * existing data stays visible. Phase D will evolve it into a masonry
 * board backed by a new becoming_items table.
 */
export default function BoardPage() {
  return (
    <AppShell>
      <AnnualCollage />
    </AppShell>
  )
}
