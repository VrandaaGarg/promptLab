import { createServerFn } from '@tanstack/react-start'
import { and, eq, gte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import { TASK_CATEGORIES } from '@/lib/domain'
import { MODEL_IDS } from '@/lib/models'
import { authMiddleware } from './middleware'

const { runs, responses, strategies } = schema

const TIMELINE_DAYS = 30

const num = (expr: ReturnType<typeof sql>) => expr.mapWith(Number)
const nullableNum = (expr: ReturnType<typeof sql>) =>
  expr.mapWith((v: unknown) => (v === null || v === undefined ? null : Number(v)))

const judgeOverall = sql`(${responses.judgeScore}->>'overall')::numeric`
const runHasWinner = sql`EXISTS (SELECT 1 FROM ${responses} AS w WHERE w.run_id = ${responses.runId} AND w.is_winner)`

export const getInsights = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      model: z.enum(MODEL_IDS).optional(),
      category: z.enum(TASK_CATEGORIES).optional(),
    }),
  )
  .handler(async ({ data, context: { user } }) => {
    const db = getDb()
    const scope = and(
      eq(runs.userId, user.id),
      data.model ? eq(runs.model, data.model) : undefined,
      data.category ? eq(runs.category, data.category) : undefined,
    )

    const since = new Date()
    since.setUTCHours(0, 0, 0, 0)
    since.setUTCDate(since.getUTCDate() - (TIMELINE_DAYS - 1))

    const [perStrategy, byCategory, timeline, [totals]] = await Promise.all([
      db
        .select({
          strategyName: responses.strategyName,
          color: sql<string | null>`max(${strategies.color})`,
          responses: num(sql`count(*)`),
          rated: num(sql`count(${responses.rating})`),
          avgRating: nullableNum(sql`avg(${responses.rating})`),
          wins: num(sql`count(*) filter (where ${responses.isWinner})`),
          contested: num(sql`count(*) filter (where ${runHasWinner})`),
          avgJudge: nullableNum(sql`avg(${judgeOverall})`),
          avgOutputTokens: nullableNum(sql`avg(${responses.outputTokens})`),
          avgCost: nullableNum(sql`avg(${responses.costUsd})`),
        })
        .from(responses)
        .innerJoin(runs, eq(responses.runId, runs.id))
        .leftJoin(strategies, eq(responses.strategyId, strategies.id))
        .where(and(scope, eq(responses.status, 'done')))
        .groupBy(responses.strategyName),

      db
        .select({
          strategyName: responses.strategyName,
          category: runs.category,
          avgJudge: nullableNum(sql`avg(${judgeOverall})`),
          avgRating: nullableNum(sql`avg(${responses.rating})`),
          wins: num(sql`count(*) filter (where ${responses.isWinner})`),
        })
        .from(responses)
        .innerJoin(runs, eq(responses.runId, runs.id))
        .where(and(scope, eq(responses.status, 'done'), sql`${runs.category} IS NOT NULL`))
        .groupBy(responses.strategyName, runs.category),

      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${runs.createdAt}), 'YYYY-MM-DD')`,
          runs: num(sql`count(*)`),
        })
        .from(runs)
        .where(and(scope, gte(runs.createdAt, since)))
        .groupBy(sql`1`)
        .orderBy(sql`1`),

      db
        .select({
          runs: num(sql`count(distinct ${runs.id})`),
          responses: num(sql`count(${responses.id})`),
          rated: num(sql`count(${responses.rating})`),
          judged: num(sql`count(${responses.judgeScore})`),
          totalCost: num(sql`coalesce(sum(${responses.costUsd}), 0)`),
          totalTokens: num(sql`coalesce(sum(coalesce(${responses.inputTokens}, 0) + coalesce(${responses.outputTokens}, 0)), 0)`),
        })
        .from(runs)
        .leftJoin(responses, eq(responses.runId, runs.id))
        .where(scope),
    ])

    // Fill missing days so charts render a continuous axis.
    const counts = new Map(timeline.map((t) => [t.day, t.runs]))
    const days = Array.from({ length: TIMELINE_DAYS }, (_, i) => {
      const d = new Date(since)
      d.setUTCDate(since.getUTCDate() + i)
      const day = d.toISOString().slice(0, 10)
      return { day, runs: counts.get(day) ?? 0 }
    })

    return {
      totals: totals ?? { runs: 0, responses: 0, rated: 0, judged: 0, totalCost: 0, totalTokens: 0 },
      perStrategy: perStrategy
        .map((s) => ({
          ...s,
          color: s.color ?? 'strategy-1',
          winRate: s.contested > 0 ? s.wins / s.contested : null,
        }))
        .sort((a, b) => (b.avgJudge ?? -1) - (a.avgJudge ?? -1)),
      byCategory,
      timeline: days,
    }
  })

export type Insights = Awaited<ReturnType<typeof getInsights>>
