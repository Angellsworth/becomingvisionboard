"use client"

/**
 * Three small sparkles that gently twinkle on/off, layered behind/around
 * the "Becoming" wordmark in the nav. CSS-only — no JS runtime cost.
 *
 * Wrap a wordmark with <WordmarkSparkles>...</WordmarkSparkles>. The
 * sparkles position themselves around the wrapped text via absolute
 * positioning; the wrapper itself stays inline.
 */
export function WordmarkSparkles({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center">
      <span
        aria-hidden
        className="absolute -top-1 -left-2 w-2 h-2 wordmark-sparkle wordmark-sparkle-0"
      >
        <Sparkle />
      </span>
      <span
        aria-hidden
        className="absolute -top-2 right-0 w-1.5 h-1.5 wordmark-sparkle wordmark-sparkle-1"
      >
        <Sparkle />
      </span>
      <span
        aria-hidden
        className="absolute -bottom-1 -right-3 w-1.5 h-1.5 wordmark-sparkle wordmark-sparkle-2"
      >
        <Sparkle />
      </span>
      {children}
      <style jsx>{`
        :global(.wordmark-sparkle) {
          animation: wordmark-twinkle 5s ease-in-out infinite;
          opacity: 0;
          color: var(--primary);
        }
        :global(.wordmark-sparkle-0) {
          animation-delay: 0s;
        }
        :global(.wordmark-sparkle-1) {
          animation-delay: 1.6s;
        }
        :global(.wordmark-sparkle-2) {
          animation-delay: 3.2s;
        }
        @keyframes wordmark-twinkle {
          0%, 70%, 100% {
            opacity: 0;
            transform: scale(0.5);
          }
          15% {
            opacity: 0.85;
            transform: scale(1);
          }
          30% {
            opacity: 0.5;
            transform: scale(0.85);
          }
        }
      `}</style>
    </span>
  )
}

function Sparkle() {
  // 4-point sparkle drawn with two thin diamonds crossing.
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden>
      <path
        d="M 12 0 L 14 10 L 24 12 L 14 14 L 12 24 L 10 14 L 0 12 L 10 10 Z"
        fill="currentColor"
      />
    </svg>
  )
}
