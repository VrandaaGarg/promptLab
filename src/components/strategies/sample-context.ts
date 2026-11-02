import type { Highlight } from '@/components/common/prompt-block'
import type { Example } from '@/lib/domain'

/** Fixed sample inputs used to preview how a strategy renders. */
export const SAMPLE_CONTEXT: { task: string; examples: Example[]; role: string } = {
  task: 'Explain the trade-offs between SQL and NoSQL databases for an early-stage startup.',
  role: 'a principal database architect who has advised dozens of early-stage startups',
  examples: [
    {
      input: 'Explain the trade-offs between monoliths and microservices for a small team.',
      output: 'Start with a monolith: one deployable, simple debugging. Split out services only when team or scaling pain is real.',
    },
    {
      input: 'Explain the trade-offs between REST and GraphQL for a mobile app.',
      output: 'REST is simple and cache-friendly; GraphQL avoids over-fetching on slow networks but adds server complexity.',
    },
    {
      input: 'Explain the trade-offs between serverless and containers for a new API.',
      output: 'Serverless minimises ops and scales to zero; containers give predictable latency and fewer platform limits.',
    },
    {
      input: 'Explain the trade-offs between buying and building an auth system.',
      output: 'Buying ships faster and offloads security; building gives control but demands ongoing expertise.',
    },
    {
      input: 'Explain the trade-offs between a mobile app and a responsive web app.',
      output: 'Web reaches everyone instantly; native apps unlock device features and better retention at a higher cost.',
    },
  ],
}

export const SAMPLE_HIGHLIGHTS: Highlight[] = [
  ...SAMPLE_CONTEXT.examples.flatMap((e) => [
    { text: e.input, tone: 'examples' as const },
    { text: e.output, tone: 'examples' as const },
  ]),
  { text: SAMPLE_CONTEXT.role, tone: 'role' },
]
