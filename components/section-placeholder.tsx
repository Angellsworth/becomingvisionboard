import type { LucideIcon } from "lucide-react"

interface SectionPlaceholderProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  features: string[]
}

/**
 * Editorial "coming soon" panel used for sections that are scaffolded
 * but not yet filled in. Establishes the visual language even before
 * the real content lands.
 */
export function SectionPlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
  features,
}: SectionPlaceholderProps) {
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-20">
      <div className="flex items-center gap-3 mb-6">
        <span className="section-mark" aria-hidden />
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-primary">{eyebrow}</p>
      </div>
      <div className="flex items-start gap-4 md:gap-6 mb-10">
        <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/12 text-primary flex items-center justify-center">
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <div>
          <h1 className="font-display text-4xl md:text-6xl tracking-[0.06em] leading-[1.05] text-foreground">
            {title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-foreground/75 leading-relaxed max-w-prose font-serif">
            {description}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Arriving here soon</p>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex gap-3 items-start text-foreground/85 leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
