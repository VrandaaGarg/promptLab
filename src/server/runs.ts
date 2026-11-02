import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, or, type SQL } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import { env } from '@/env'
import { MAX_EXAMPLES, MAX_TASK_LENGTH, TASK_CATEGORIES, type Example } from '@/lib/domain'
import { MODEL_IDS, pickJudgeModel } from '@/lib/models'
import { renderStrategyPrompt, strategyUsesRole } from '@/lib/strategies'
import { judgeResponses } from './ai/judge'
import { prepareRunContext } from './ai/prepare'
import { authMiddleware } from './middleware'

const { runs, responses, strategies } = schema

const FALLBACK_COLOR = 'strategy-1'
const FALLBACK_ICON = 'sparkles'
const STALE_STREAM_MS = 5 * 60 * 1000

async function loadRunDetail(where: SQL) {
  const db = getDb()
  const [run] = await db.select().from(runs).where(where).limit(1)
  if (!run) return null

  const rows = await db
    .select({
      response: responses,
      color: strategies.color,
      icon: strategies.icon,
    })
    .from(responses)
    .leftJoin(strategies, eq(responses.strategyId, strategies.id))
    .where(eq(responses.runId, run.id))
    .orderBy(asc(responses.position))

  return {
    ...run,
    responses: rows.map(({ response, color, icon }) => ({
      ...response,
      color: color ?? FALLBACK_COLOR,
      icon: icon ?? FALLBACK_ICON,
    })),
  }
}

export type RunDetail = NonNullable<Awaited<ReturnType<typeof loadRunDetail>>>
export type RunResponse = RunDetail['responses'][number]

async function requireOwnedRun(runId: string, userId: string): Promise<RunDetail> {
  const run = await loadRunDetail(and(eq(runs.id, runId), eq(runs.userId, userId))!)
  if (!run) throw new Error('Run not found')
  return run
}

async function requireOwnedResponse(responseId: string, userId: string) {
  const [row] = await getDb()
    .select({ id: responses.id, runId: responses.runId })
    .from(responses)
    .innerJoin(runs, eq(responses.runId, runs.id))
    .where(and(eq(responses.id, responseId), eq(runs.userId, userId)))
    .limit(1)
  if (!row) throw new Error('Response not found')
  return row
}

// ─── Create ──────────────────────────────────────────────────

const exampleSchema = z.object({
  input: z.string().trim().min(1).max(2000),
  output: z.string().trim().min(1).max(4000),
})

const createRunSchema = z.object({
  task: z.string().trim().min(1, 'Describe a task').max(MAX_TASK_LENGTH),
  model: z.enum(MODEL_IDS),
  strategyIds: z.array(z.uuid()).min(1, 'Pick at least one strategy').max(8),
  blindMode: z.boolean().default(false),
  examples: z.array(exampleSchema).max(MAX_EXAMPLES).default([]),
})

export type CreateRunInput = z.input<typeof createRunSchema>

export const createRun = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createRunSchema)
  .handler(async ({ data, context: { user } }) => {
    const db = getDb()

    const [recent] = await db
      .select({ value: count() })
      .from(runs)
      .where(and(eq(runs.userId, user.id), gte(runs.createdAt, new Date(Date.now() - 60 * 60 * 1000))))
    const limit = env().RUNS_PER_HOUR
    if ((recent?.value ?? 0) >= limit) {
      throw new Error(`Rate limit reached: ${limit} runs per hour. Please try again later.`)
    }

    const ids = [...new Set(data.strategyIds)]
    const found = await db
      .select()
      .from(strategies)
      .where(and(inArray(strategies.id, ids), or(isNull(strategies.userId), eq(strategies.userId, user.id))))
    const selected = ids.map((id) => found.find((s) => s.id === id)).filter((s) => s !== undefined)
    if (selected.length === 0) throw new Error('No valid strategies selected')

    const exampleCount = Math.max(0, ...selected.map((s) => s.exampleCount))
    const hasUserExamples = data.examples.length > 0
    const prepared = await prepareRunContext({
      task: data.task,
      exampleCount: hasUserExamples ? 0 : exampleCount,
      needsRole: selected.some(strategyUsesRole),
    })
    const examples: Example[] = hasUserExamples ? data.examples : prepared.examples

    const runId = crypto.randomUUID()
    await db.batch([
      db.insert(runs).values({
        id: runId,
        userId: user.id,
        task: data.task,
        examples,
        model: data.model,
        judgeModel: pickJudgeModel(data.model),
        blindMode: data.blindMode,
      }),
      db.insert(responses).values(
        selected.map((strategy, position) => ({
          runId,
          strategyId: strategy.id,
          strategyName: strategy.name,
          position,
          model: data.model,
          ...renderStrategyPrompt(strategy, { task: data.task, examples, role: prepared.role }),
        })),
      ),
    ])

    return requireOwnedRun(runId, user.id)
  })

// ─── Read ────────────────────────────────────────────────────

const idSchema = z.object({ id: z.uuid() })

export const getRun = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(({ data, context: { user } }) => requireOwnedRun(data.id, user.id))

export const getSharedRun = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(32) }))
  .handler(async ({ data }) => {
    const run = await loadRunDetail(eq(runs.shareSlug, data.slug))
    if (!run) throw new Error('This shared run does not exist or is no longer shared')
    const { userId: _userId, ...publicRun } = run
    return publicRun
  })

const listRunsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(50).default(15),
  search: z.string().trim().max(200).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  model: z.enum(MODEL_IDS).optional(),
})

export type ListRunsInput = z.input<typeof listRunsSchema>

export const listRuns = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(listRunsSchema)
  .handler(async ({ data, context: { user } }) => {
    const db = getDb()
    const filters = and(
      eq(runs.userId, user.id),
      data.search ? ilike(runs.task, `%${data.search.replace(/[%_\\]/g, '\\$&')}%`) : undefined,
      data.category ? eq(runs.category, data.category) : undefined,
      data.model ? eq(runs.model, data.model) : undefined,
    )

    const [items, [total]] = await Promise.all([
      db
        .select({
          id: runs.id,
          task: runs.task,
          category: runs.category,
          model: runs.model,
          createdAt: runs.createdAt,
          shareSlug: runs.shareSlug,
        })
        .from(runs)
        .where(filters)
        .orderBy(desc(runs.createdAt))
        .limit(data.pageSize)
        .offset((data.page - 1) * data.pageSize),
      db.select({ value: count() }).from(runs).where(filters),
    ])

    const stats = items.length
      ? await db
          .select({
            runId: responses.runId,
            strategyName: responses.strategyName,
            rating: responses.rating,
            isWinner: responses.isWinner,
            judgeScore: responses.judgeScore,
          })
          .from(responses)
          .where(inArray(responses.runId, items.map((r) => r.id)))
      : []

    return {
      total: total?.value ?? 0,
      page: data.page,
      pageSize: data.pageSize,
      items: items.map((run) => {
        const own = stats.filter((s) => s.runId === run.id)
        const ratings = own.map((s) => s.rating).filter((r): r is number => r !== null)
        const judged = own.filter((s) => s.judgeScore)
        const topJudged = judged.reduce<(typeof judged)[number] | undefined>(
          (best, s) => (!best || s.judgeScore!.overall > best.judgeScore!.overall ? s : best),
          undefined,
        )
        return {
          ...run,
          strategyCount: own.length,
          avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
          winner: own.find((s) => s.isWinner)?.strategyName ?? null,
          judgeTop: topJudged?.strategyName ?? null,
        }
      }),
    }
  })

export type RunListItem = Awaited<ReturnType<typeof listRuns>>['items'][number]

// ─── Judge ───────────────────────────────────────────────────

export const judgeRun = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context: { user } }) => {
    const run = await requireOwnedRun(data.id, user.id)
    const now = Date.now()
    const inFlight = run.responses.some(
      (r) =>
        r.status === 'pending' ||
        (r.status === 'streaming' && now - r.createdAt.getTime() < STALE_STREAM_MS),
    )
    if (inFlight) throw new Error('Responses are still being generated')

    const candidates = run.responses.filter((r) => r.status === 'done' && r.output.trim())
    if (candidates.length === 0) throw new Error('There are no completed responses to judge')
    if (candidates.every((r) => r.judgeScore)) return run

    const { category, scores } = await judgeResponses(run.task, run.judgeModel, candidates)
    const db = getDb()
    await db.batch([
      db.update(runs).set({ category }).where(eq(runs.id, run.id)),
      ...candidates.map((c) =>
        db
          .update(responses)
          .set({ judgeScore: scores.get(c.id) ?? null })
          .where(eq(responses.id, c.id)),
      ),
    ])
    return requireOwnedRun(run.id, user.id)
  })

// ─── Feedback ────────────────────────────────────────────────

export const rateResponse = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ responseId: z.uuid(), rating: z.number().int().min(1).max(5).nullable() }))
  .handler(async ({ data, context: { user } }) => {
    await requireOwnedResponse(data.responseId, user.id)
    await getDb().update(responses).set({ rating: data.rating }).where(eq(responses.id, data.responseId))
    return { responseId: data.responseId, rating: data.rating }
  })

export const setWinner = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ responseId: z.uuid(), isWinner: z.boolean() }))
  .handler(async ({ data, context: { user } }) => {
    const { runId } = await requireOwnedResponse(data.responseId, user.id)
    const db = getDb()
    await db.batch([
      db.update(responses).set({ isWinner: false }).where(eq(responses.runId, runId)),
      db.update(responses).set({ isWinner: data.isWinner }).where(eq(responses.id, data.responseId)),
    ])
    return { runId, responseId: data.responseId, isWinner: data.isWinner }
  })

// ─── Manage ──────────────────────────────────────────────────

export const setRunSharing = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.uuid(), shared: z.boolean() }))
  .handler(async ({ data, context: { user } }) => {
    const run = await requireOwnedRun(data.id, user.id)
    const shareSlug = data.shared ? (run.shareSlug ?? nanoid(12)) : null
    await getDb().update(runs).set({ shareSlug }).where(eq(runs.id, run.id))
    return { id: run.id, shareSlug }
  })

export const deleteRun = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ data, context: { user } }) => {
    const deleted = await getDb()
      .delete(runs)
      .where(and(eq(runs.id, data.id), eq(runs.userId, user.id)))
      .returning({ id: runs.id })
    if (deleted.length === 0) throw new Error('Run not found')
    return { id: data.id }
  })
