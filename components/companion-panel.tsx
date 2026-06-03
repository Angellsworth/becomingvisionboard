"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, X, RotateCcw, AlertTriangle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useCompanion } from "@/components/companion-provider"
import { readCompanionContext } from "@/lib/companion/context"

const STORAGE_KEY = "becoming-companion-messages"

const STARTER_PROMPTS = [
  "I'm stuck and I don't know why.",
  "Help me see this differently.",
  "What am I avoiding?",
  "I'm scared to start.",
]

export function CompanionPanel() {
  const { open, setOpen } = useCompanion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState("")
  const [needsConfig, setNeedsConfig] = useState(false)

  // Load any saved conversation on mount.
  const [initialMessages] = useState(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            context: readCompanionContext(),
          },
        }),
      }),
    [],
  )

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    messages: initialMessages,
    onError: (err) => {
      // 503 means the API key isn't set — surface a friendly config notice.
      if (err?.message?.includes("not configured")) {
        setNeedsConfig(true)
      }
    },
  })

  // Persist messages whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  // Scroll to bottom whenever messages or streaming updates.
  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, open, status])

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 220)
    }
  }, [open])

  // Lock body scroll while the panel is open (mobile especially).
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Escape closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, setOpen])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput("")
    await sendMessage({ text: trimmed })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSend(input)
  }

  const handleStarter = async (prompt: string) => {
    await handleSend(prompt)
  }

  const handleClear = () => {
    if (!window.confirm("Clear this conversation? It will not be recovered.")) return
    setMessages([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const showStarters = messages.length === 0 && !needsConfig
  const isStreaming = status === "streaming" || status === "submitted"

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel — bottom sheet on mobile, right drawer on desktop */}
      <aside
        className={cn(
          "fixed z-50 bg-background border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 h-[92vh] rounded-t-3xl border-t",
          // Desktop: right drawer
          "md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:w-[480px] md:rounded-none md:rounded-l-3xl md:border-l md:border-t-0",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Becoming Companion"
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <span className="w-12 h-1 rounded-full bg-foreground/15" aria-hidden />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-3 md:py-4 border-b border-border">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary">Companion</p>
            <h2 className="font-display text-xl md:text-2xl tracking-[0.04em] text-foreground">
              Becoming
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="w-9 h-9 flex items-center justify-center rounded-full text-foreground/55 hover:text-foreground hover:bg-card/60 transition-colors"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-foreground/65 hover:text-foreground hover:bg-card/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 md:px-6 py-5 md:py-6 space-y-4">
          {needsConfig ? (
            <ConfigNotice />
          ) : showStarters ? (
            <Welcome onStarter={handleStarter} />
          ) : (
            messages.map((m, i) => <Message key={m.id ?? i} message={m} />)
          )}

          {isStreaming && messages.length > 0 && (
            <div className="flex items-center gap-1.5 px-1 py-2 text-foreground/40">
              <span className="w-2 h-2 rounded-full bg-foreground/40 typing-dot" />
              <span className="w-2 h-2 rounded-full bg-foreground/40 typing-dot typing-dot-1" />
              <span className="w-2 h-2 rounded-full bg-foreground/40 typing-dot typing-dot-2" />
            </div>
          )}

          {error && !needsConfig && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error.message || "Something went wrong. Try again?"}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border px-3 md:px-4 py-3 bg-background"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void handleSubmit(e as unknown as React.FormEvent)
                }
              }}
              placeholder="Write to her…"
              rows={1}
              className="flex-1 resize-none bg-card border border-border rounded-2xl px-4 py-2.5 text-base text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all max-h-32"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={cn(
                "w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all",
                input.trim() && !isStreaming
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-foreground/35 cursor-not-allowed",
              )}
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <style jsx>{`
          :global(.typing-dot) {
            animation: typing-bounce 1.2s ease-in-out infinite;
          }
          :global(.typing-dot-1) {
            animation-delay: 0.15s;
          }
          :global(.typing-dot-2) {
            animation-delay: 0.3s;
          }
          @keyframes typing-bounce {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-4px);
              opacity: 1;
            }
          }
        `}</style>
      </aside>
    </>
  )
}

// --- Subcomponents ---------------------------------------------------------

function Welcome({ onStarter }: { onStarter: (s: string) => void }) {
  return (
    <div className="py-4">
      <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">
        Begin where you are
      </p>
      <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed mb-1">
        I'm here to listen.
      </p>
      <p className="font-serif italic text-base text-foreground/65 mb-5 leading-relaxed">
        I know what you've written about who you're becoming. Tell me where you
        are today.
      </p>

      <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/45 mb-2">
        Or try one of these
      </p>
      <div className="flex flex-col gap-2">
        {STARTER_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onStarter(p)}
            className="text-left px-4 py-3 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/40 transition-all font-serif italic text-foreground/85 text-base"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

function ConfigNotice() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-primary" />
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary">Setup needed</p>
      </div>
      <p className="font-serif text-base text-foreground leading-relaxed mb-3">
        The Companion needs an Anthropic API key to speak. It's free to sign up.
      </p>
      <ol className="font-serif text-base text-foreground/85 space-y-1.5 leading-relaxed list-decimal list-inside">
        <li>
          Visit{" "}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            console.anthropic.com
          </a>
          .
        </li>
        <li>Sign up. Add ~$5 of credit (hundreds of conversations).</li>
        <li>Create an API key.</li>
        <li>
          Add{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted/60 text-sm">ANTHROPIC_API_KEY</code>{" "}
          to your <code className="px-1.5 py-0.5 rounded bg-muted/60 text-sm">.env.local</code>.
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </div>
  )
}

// --- Message bubble --------------------------------------------------------

import type { UIMessage } from "ai"

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  // Extract text from message parts (the v5 UIMessage format).
  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("")
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border text-foreground rounded-bl-md",
        )}
      >
        <p
          className={cn(
            "whitespace-pre-wrap leading-relaxed",
            isUser ? "text-base" : "font-serif text-base md:text-[17px]",
          )}
        >
          {text}
        </p>
      </div>
    </div>
  )
}
