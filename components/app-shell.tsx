import { Navigation } from "@/components/navigation"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

/**
 * Standard wrapper for every signed-in app page.
 * Handles top-bar offset (16 desktop, 14 mobile) and bottom-tab offset on mobile.
 */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <>
      <Navigation />
      <main
        className={cn(
          "min-h-screen pt-14 md:pt-16 pb-24 md:pb-8",
          className,
        )}
      >
        {children}
      </main>
    </>
  )
}
