import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, isNull, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import { strategyInputSchema, type StrategyInput } from '@/lib/validation'
import { authMiddleware } from './middleware'

const { strategies } = schema

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'strategy'
  )
}

export const listStrategies = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context: { user } }) =>
    getDb()
      .select()
      .from(strategies)
      .where(or(isNull(strategies.userId), eq(strategies.userId, user.id)))
      // Built-ins first (in seed order), then custom strategies by creation date.
      .orderBy(sql`${strategies.userId} IS NOT NULL`, asc(strategies.createdAt), asc(strategies.name)),
  )

export type Strategy = Awaited<ReturnType<typeof listStrategies>>[number]

function toValues(data: StrategyInput) {
  return {
    ...data,
    slug: slugify(data.name),
    systemPrompt: data.systemPrompt || null,
  }
}

export const createStrategy = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(strategyInputSchema)
  .handler(async ({ data, context: { user } }) => {
    const [created] = await getDb()
      .insert(strategies)
      .values({ ...toValues(data), userId: user.id })
      .returning()
    return created!
  })

export const updateStrategy = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(strategyInputSchema.extend({ id: z.uuid() }))
  .handler(async ({ data: { id, ...data }, context: { user } }) => {
    const [updated] = await getDb()
      .update(strategies)
      .set(toValues(data))
      .where(and(eq(strategies.id, id), eq(strategies.userId, user.id)))
      .returning()
    if (!updated) throw new Error('Strategy not found or not editable')
    return updated
  })

export const deleteStrategy = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data, context: { user } }) => {
    const deleted = await getDb()
      .delete(strategies)
      .where(and(eq(strategies.id, data.id), eq(strategies.userId, user.id)))
      .returning({ id: strategies.id })
    if (deleted.length === 0) throw new Error('Strategy not found or not deletable')
    return { id: data.id }
  })
