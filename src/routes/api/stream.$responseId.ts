import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import { errorMessage, languageModel, readCost } from '@/server/ai/provider'
import { getSessionUser } from '@/server/middleware'

const { responses, runs } = schema

const MAX_OUTPUT_TOKENS = 2048
/** Must stay below the stale threshold in `src/server/runs.ts`. */
const GENERATION_TIMEOUT_MS = 3 * 60 * 1000

export const Route = createFileRoute('/api/stream/$responseId')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await getSessionUser(request.headers)
        if (!user) return new Response('Unauthorized', { status: 401 })

        const responseId = z.uuid().safeParse(params.responseId)
        if (!responseId.success) return new Response('Invalid response id', { status: 400 })

        const db = getDb()

        // Atomically claim a pending response owned by this user, so a response is only ever generated once.
        const [claimed] = await db
          .update(responses)
          .set({ status: 'streaming' })
          .where(
            and(
              eq(responses.id, responseId.data),
              eq(responses.status, 'pending'),
              inArray(
                responses.runId,
                db.select({ id: runs.id }).from(runs).where(eq(runs.userId, user.id)),
              ),
            ),
          )
          .returning({
            id: responses.id,
            model: responses.model,
            systemPrompt: responses.systemPrompt,
            userPrompt: responses.userPrompt,
          })

        if (!claimed) return new Response('Response not found or already generated', { status: 409 })

        let streamError: unknown
        const result = streamText({
          model: languageModel(claimed.model),
          instructions: claimed.systemPrompt ?? undefined,
          prompt: claimed.userPrompt,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          timeout: GENERATION_TIMEOUT_MS,
          onError: ({ error }) => {
            streamError = error
          },
        })

        const encoder = new TextEncoder()
        let clientGone = false
        let controller!: ReadableStreamDefaultController<Uint8Array>
        const body = new ReadableStream<Uint8Array>({
          start: (c) => {
            controller = c
          },
          cancel: () => {
            clientGone = true
          },
        })

        // Generation is decoupled from the HTTP connection: it finishes and is persisted even if the
        // client disconnects, and the result is saved before the stream closes so the client can rely on it.
        // Final writes only apply while still `streaming`, so rows already expired as stale stay untouched.
        const stillStreaming = and(eq(responses.id, claimed.id), eq(responses.status, 'streaming'))

        void (async () => {
          let text = ''
          try {
            for await (const delta of result.textStream) {
              text += delta
              if (!clientGone) controller.enqueue(encoder.encode(delta))
            }
            if (streamError && !text) throw streamError
            const [usage, finalStep] = await Promise.all([result.usage, result.finalStep])
            await db
              .update(responses)
              .set({
                output: text,
                status: 'done',
                inputTokens: usage.inputTokens ?? null,
                outputTokens: usage.outputTokens ?? null,
                costUsd: readCost(finalStep.providerMetadata),
              })
              .where(stillStreaming)
          } catch (error) {
            await db
              .update(responses)
              .set({ output: text, status: 'error', error: errorMessage(error).slice(0, 500) })
              .where(stillStreaming)
              .catch(() => undefined)
            if (!clientGone) controller.error(error)
            return
          }
          if (!clientGone) controller.close()
        })().catch(() => undefined)

        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
          },
        })
      },
    },
  },
})
