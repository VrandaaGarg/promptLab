import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, desc, eq, ilike, inArray, isNull, lt, or, sql, type SQL } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import { env } from '@/env'
import {
  MAX_EXAMPLES,
  MAX_PROMPT_CHARS,
  MAX_STRATEGIES_PER_RUN,
  MAX_TASK_LENGTH,
  TASK_CATEGORIES,
  type Example,
} from '@/lib/domain'
import { MODEL_IDS, pickJudgeModel } from '@/lib/models'
import { DEFAULT_ROLE, renderStrategyPrompt, strategyUsesRole } from '@/lib/strategies'
import { judgeResponses } from './ai/judge'
import { prepareRunContext } from './ai/prepare'
import { authMiddleware } from './middleware'

const { runs, responses, strategies } = schema

const FALLBACK_COLOR = 'strategy-1'
const FALLBACK_ICON = 'sparkles'
/** Generation has a hard timeout well below this, so older in-flight rows were abandoned. */
const STALE_RESPONSE_MS = 5 * 60 * 1000
const JUDGE_LOCK_MS = 2 * 60 * 1000

/** Marks responses that never started or never finished (closed tab, crashed process) as failed. */
async function expireStaleResponses(runId: string) {
  await getDb()
    .update(responses)
    .set({ status: 'error', error: 'Generation did not complete' })
    .where(
      and(
        eq(responses.runId, runId),
        inArray(responses.status, ['pending', 'streaming']),
        lt(responses.createdAt, new Date(Date.now() - STALE_RESPONSE_MS)),
      ),
    )
}

async function loadRunDetail(where: SQL) {
  const db = getDb()
  const [run] = await db.select().from(runs).where(where).limit(1)
  if (!run) return null
  await expireStaleResponses(run.id)

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
  strategyIds: z.array(z.uuid()).min(1, 'Pick at least one strategy').max(MAX_STRATEGIES_PER_RUN),
  blindMode: z.boolean().default(false),
  examples: z.array(exampleSchema).max(MAX_EXAMPLES).default([]),
})

export type CreateRunInput = z.input<typeof createRunSchema>

export const createRun = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createRunSchema)
  .handler(async ({ data, context: { user } }) => {
    const db = getDb()

    const ids = [...new Set(data.strategyIds)]
    const found = await db
      .select()
      .from(strategies)
      .where(and(inArray(strategies.id, ids), or(isNull(strategies.userId), eq(strategies.userId, user.id))))
    if (found.length !== ids.length) {
      throw new Error('Some selected strategies are no longer available. Refresh and try again.')
    }
    const selected = ids.map((id) => found.find((s) => s.id === id)!)

    const renderAll = (examples: Example[], role: string) =>
      selected.map((strategy, position) => ({
        runId,
        strategyId: strategy.id,
        strategyName: strategy.name,
        position,
        model: data.model,
        ...renderStrategyPrompt(strategy, { task: data.task, examples, role }),
      }))
    const assertWithinBudget = (rows: ReturnType<typeof renderAll>) => {
      const oversized = rows.find((r) => (r.systemPrompt?.length ?? 0) + r.userPrompt.length > MAX_PROMPT_CHARS)
      if (oversized) {
        throw new Error(`The “${oversized.strategyName}” prompt is too long. Shorten the task or the strategy template.`)
      }
    }

    // Preflight before spending anything (examples are added later and are size-bounded).
    const runId = crypto.randomUUID()
    assertWithinBudget(renderAll(data.examples, DEFAULT_ROLE))

    // Reserve the run slot before any paid model call. The advisory lock serialises concurrent
    // requests from the same user inside the batch transaction, so the hourly limit is exact.
    const limit = env().RUNS_PER_HOUR
    const [, reserved] = await db.batch([
      db.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`),
      db.execute(sql`
        INSERT INTO ${runs} (id, user_id, task, model, judge_model, blind_mode)
        SELECT ${runId}, ${user.id}, ${data.task}, ${data.model}, ${pickJudgeModel(data.model)}, ${data.blindMode}
        WHERE (
          SELECT count(*) FROM ${runs}
          WHERE user_id = ${user.id} AND created_at > now() - interval '1 hour'
        ) < ${limit}
        RETURNING id`),
    ])
    if (reserved.rows.length === 0) {
      throw new Error(`Rate limit reached: ${limit} runs per hour. Please try again later.`)
    }

    try {
      const exampleCount = Math.max(0, ...selected.map((s) => s.exampleCount))
      const hasUserExamples = data.examples.length > 0
      const prepared = await prepareRunContext({
        task: data.task,
        exampleCount: hasUserExamples ? 0 : exampleCount,
        needsRole: selected.some(strategyUsesRole),
      })
      const examples: Example[] = hasUserExamples ? data.examples : prepared.examples

      const rows = renderAll(examples, prepared.role)
      assertWithinBudget(rows)

      await db.batch([
        db.update(runs).set({ examples }).where(eq(runs.id, runId)),
        db.insert(responses).values(rows),
      ])
    } catch (error) {
      // Release the reserved slot so a failed preparation does not count against the limit.
      await db.delete(runs).where(eq(runs.id, runId))
      throw error
    }

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
    // Personal feedback, owner identity and raw provider errors stay private.
    const { userId: _userId, judgeStartedAt: _judgeStartedAt, ...publicRun } = run
    return {
      ...publicRun,
      responses: run.responses.map((r) => ({
        ...r,
        rating: null,
        isWinner: false,
        error: r.error ? 'Generation failed' : null,
      })),
    }
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
    if (run.responses.some((r) => r.status === 'pending' || r.status === 'streaming')) {
      throw new Error('Responses are still being generated')
    }
    const candidates = run.responses.filter((r) => r.status === 'done' && r.output.trim())
    if (candidates.length === 0) throw new Error('There are no completed responses to judge')
    if (candidates.every((r) => r.judgeScore)) return run

    // Expiring lock: only one judge call per run at a time, even across tabs.
    const db = getDb()
    const [claimed] = await db
      .update(runs)
      .set({ judgeStartedAt: new Date() })
      .where(
        and(
          eq(runs.id, run.id),
          or(isNull(runs.judgeStartedAt), lt(runs.judgeStartedAt, new Date(Date.now() - JUDGE_LOCK_MS))),
        ),
      )
      .returning({ id: runs.id })
    if (!claimed) throw new Error('The AI judge is already scoring this run')

    try {
      const { category, scores } = await judgeResponses(run.task, run.judgeModel, candidates)
      await db.batch([
        db.update(runs).set({ category, judgeStartedAt: null }).where(eq(runs.id, run.id)),
        ...candidates.map((c) =>
          db
            .update(responses)
            .set({ judgeScore: scores.get(c.id)! })
            .where(eq(responses.id, c.id)),
        ),
      ])
    } catch (error) {
      await db.update(runs).set({ judgeStartedAt: null }).where(eq(runs.id, run.id))
      throw error
    }
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
