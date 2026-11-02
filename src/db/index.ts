import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env } from '@/env'
import * as schema from './schema'

function createDb() {
  return drizzle({ client: neon(env().DATABASE_URL), schema, casing: 'snake_case' })
}

type Database = ReturnType<typeof createDb>

let instance: Database | undefined

/** Lazily-created Drizzle client (Neon HTTP driver). Server-only. */
export function getDb(): Database {
  instance ??= createDb()
  return instance
}

export { schema }
