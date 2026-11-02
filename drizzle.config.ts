import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

// `db:generate` works offline; `db:migrate`, `db:push` and `db:studio` need DATABASE_URL.
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  casing: 'snake_case',
  strict: true,
  verbose: true,
})
