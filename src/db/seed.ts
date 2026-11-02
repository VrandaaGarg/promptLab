import 'dotenv/config'
import { and, eq, isNull } from 'drizzle-orm'
import { BUILT_IN_STRATEGIES } from '@/lib/strategies'
import { getDb, schema } from './index'

const { strategies } = schema

/** Idempotently inserts or refreshes the built-in strategies. */
async function seed() {
  const db = getDb()
  for (const strategy of BUILT_IN_STRATEGIES) {
    const [existing] = await db
      .select({ id: strategies.id })
      .from(strategies)
      .where(and(isNull(strategies.userId), eq(strategies.slug, strategy.slug)))
      .limit(1)

    if (existing) {
      await db.update(strategies).set(strategy).where(eq(strategies.id, existing.id))
      console.log(`updated  ${strategy.name}`)
    } else {
      await db.insert(strategies).values({ ...strategy, userId: null })
      console.log(`inserted ${strategy.name}`)
    }
  }
}

seed()
  .then(() => {
    console.log('Seed complete.')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
