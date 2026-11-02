import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { RESPONSE_STATUSES, TASK_CATEGORIES, type Example, type JudgeScore } from '@/lib/domain'
import { user } from './auth'

export const taskCategory = pgEnum('task_category', TASK_CATEGORIES)
export const responseStatus = pgEnum('response_status', RESPONSE_STATUSES)

/** Prompting techniques. `userId = null` marks a built-in strategy. */
export const strategies = pgTable(
  'strategies',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().references(() => user.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    slug: text().notNull(),
    description: text().notNull().default(''),
    systemPrompt: text(),
    template: text().notNull(),
    exampleCount: smallint().notNull().default(0),
    color: text().notNull(),
    icon: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index('strategies_user_id_idx').on(t.userId)],
)

/** One experiment: a task executed with several strategies on one model. */
export const runs = pgTable(
  'runs',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    task: text().notNull(),
    examples: jsonb().$type<Example[]>().notNull().default([]),
    category: taskCategory(),
    model: text().notNull(),
    judgeModel: text().notNull(),
    blindMode: boolean().notNull().default(false),
    shareSlug: text().unique(),
    /** Set while the AI judge is scoring; acts as an expiring lock against duplicate judge calls. */
    judgeStartedAt: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (t) => [index('runs_user_created_idx').on(t.userId, t.createdAt.desc())],
)

/** One strategy's output inside a run. Prompts are snapshotted so history never drifts. */
export const responses = pgTable(
  'responses',
  {
    id: uuid().primaryKey().defaultRandom(),
    runId: uuid()
      .notNull()
      .references(() => runs.id, { onDelete: 'cascade' }),
    strategyId: uuid().references(() => strategies.id, { onDelete: 'set null' }),
    strategyName: text().notNull(),
    position: smallint().notNull().default(0),
    model: text().notNull(),
    systemPrompt: text(),
    userPrompt: text().notNull(),
    output: text().notNull().default(''),
    status: responseStatus().notNull().default('pending'),
    error: text(),
    inputTokens: integer(),
    outputTokens: integer(),
    costUsd: numeric({ precision: 12, scale: 6, mode: 'number' }),
    rating: smallint(),
    isWinner: boolean().notNull().default(false),
    judgeScore: jsonb().$type<JudgeScore>(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (t) => [
    index('responses_run_id_idx').on(t.runId),
    index('responses_strategy_name_idx').on(t.strategyName),
    check('responses_rating_check', sql`${t.rating} IS NULL OR ${t.rating} BETWEEN 1 AND 5`),
  ],
)
