# PromptLab

Make prompt engineering visible, comparable and measurable. Enter one task and watch zero-shot, one-shot, few-shot, chain-of-thought and role-based prompts stream side by side. Rate the responses, let an AI judge score them blind, and track which strategy wins over time.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start (Router, Query, Form, Table) on Vite 8 |
| AI | Vercel AI SDK 7 + OpenRouter (DeepSeek, Qwen, Kimi) |
| Database | Neon Postgres + Drizzle ORM |
| Auth | Better Auth (email + password) |
| UI | Tailwind CSS v4, Motion, Lucide + React Icons, Recharts |

## Getting started

```bash
pnpm install
cp .env.example .env      # fill in the values
pnpm db:migrate           # create tables in Neon
pnpm db:seed              # insert the 5 built-in strategies
pnpm dev                  # http://localhost:3000
```

## Environment

See [`.env.example`](./.env.example):

- `DATABASE_URL` – Neon pooled connection string
- `OPENROUTER_API_KEY` – OpenRouter key
- `BETTER_AUTH_SECRET` – 32+ random characters (`openssl rand -base64 32`)
- `BETTER_AUTH_URL` – public app URL
- `RUNS_PER_HOUR` – per-user run limit (default 20)

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve `.output` |
| `pnpm typecheck` | TypeScript check |
| `pnpm db:generate` | Generate a migration after schema changes |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Upsert built-in strategies |
| `pnpm db:studio` | Open Drizzle Studio |

## How a run works

1. `createRun` checks the rate limit. If the run needs them, it generates worked examples and an expert persona with DeepSeek V4 Flash, then saves the run and one `pending` response per strategy, along with the exact prompts.
2. The browser opens one stream per response (`POST /api/stream/:responseId`). The server atomically claims the response, streams it from OpenRouter, and saves the output, tokens and cost **before** closing the stream. Generation keeps going even if the tab is closed.
3. When every stream has finished, `judgeRun` scores the anonymised responses with a different model (Qwen 3.8 Max, or DeepSeek V4 Pro when Qwen 3.8 Max produced the responses) and assigns a task category.
4. Ratings, the winner pick and share links update the cache optimistically. Insights are aggregated in SQL.

## Project structure

```
src/
  db/            Drizzle client, schema (auth + app), seed
  env.ts         Validated server env
  lib/           Client-safe domain, models, strategies, validation, queries, auth client
  server/        Server functions (runs, strategies, insights, session), auth middleware, AI (prepare, judge)
  hooks/         Mutations and the parallel streaming hook
  components/    ui/ primitives, theme, and feature folders
  routes/        File routes (+ api/auth, api/stream server routes)
drizzle/         SQL migrations
```
