// Server route for the Becoming Companion.
// Streams Claude responses via the Vercel AI SDK.

import { anthropic } from "@ai-sdk/anthropic"
import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { buildSystemPrompt } from "@/lib/companion/system-prompt"
import type { CompanionContext } from "@/lib/companion/context"

// Allow streaming responses up to 60s.
export const maxDuration = 60

interface ChatRequestBody {
  messages: UIMessage[]
  context?: CompanionContext
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Companion is not configured. Add ANTHROPIC_API_KEY to .env.local — see .env.example.",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    )
  }

  let body: ChatRequestBody
  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const ctx: CompanionContext = body.context ?? {
    futureSelf: null,
    recentPins: [],
    displayName: null,
  }
  const systemPrompt = buildSystemPrompt(ctx)

  const result = streamText({
    // Sonnet 4.5 — warm + thoughtful, the right register for this companion.
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: systemPrompt,
    messages: convertToModelMessages(body.messages),
    temperature: 0.85,
  })

  return result.toUIMessageStreamResponse()
}
