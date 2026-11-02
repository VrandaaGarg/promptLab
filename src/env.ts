import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  OPENROUTER_API_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.url(),
  RUNS_PER_HOUR: z.coerce.number().int().positive().default(20),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cached: ServerEnv | undefined

/** Validated server-side environment. Throws a readable error on first access if misconfigured. */
export function env(): ServerEnv {
  if (cached) return cached
  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables (see .env.example):\n${issues}`)
  }
  cached = parsed.data
  return cached
}
