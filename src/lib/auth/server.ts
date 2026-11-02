import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getDb, schema } from '@/db'
import { env } from '@/env'

function createAuth() {
  const { BETTER_AUTH_SECRET, BETTER_AUTH_URL } = env()
  return betterAuth({
    secret: BETTER_AUTH_SECRET,
    baseURL: BETTER_AUTH_URL,
    database: drizzleAdapter(getDb(), { provider: 'pg', schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
    },
    // Must stay last so cookies set by other plugins are forwarded by TanStack Start.
    plugins: [tanstackStartCookies()],
  })
}

type Auth = ReturnType<typeof createAuth>

let instance: Auth | undefined

/** Lazily-created Better Auth instance. Server-only. */
export function getAuth(): Auth {
  instance ??= createAuth()
  return instance
}
