import { Crown, Scale } from 'lucide-react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import { ProviderIcon } from '@/components/common/provider-icon'
import { StrategyIcon, strategyColor } from '@/components/common/strategy-visual'
import { BUILT_IN_STRATEGIES } from '@/lib/strategies'
import { cn } from '@/lib/utils'

const TASK = 'Why is the sky blue? Explain it for a curious 10-year-old.'

/** Faux outputs, characters revealed per tick, and judge scores for each built-in strategy. */
const COLUMNS = [
  {
    text: 'Sunlight is a mix of every color. When it reaches the air, tiny gas molecules scatter blue light far more than red, so blue reaches your eyes from every direction.',
    speed: 2.6,
    score: 7.8,
  },
  {
    text: 'Think of sunlight as a box of crayons. The air keeps bumping into the blue crayon, bouncing it all over the sky. Look up, and blue is everywhere.',
    speed: 2.1,
    score: 8.2,
  },
  {
    text: 'Light from the Sun holds many colors. Air molecules are tiny, and tiny things scatter short blue waves best. That is why the sky glows blue and sunsets turn orange.',
    speed: 1.8,
    score: 8.4,
  },
  {
    text: '1. Sunlight contains all colors.\n2. Blue light travels in short waves.\n3. Air scatters short waves the most.\n\nAnswer: scattered blue light reaches us from all over the sky.',
    speed: 1.5,
    score: 8.9,
  },
  {
    text: "As a science teacher, here's my favorite way to put it: air is a pinball machine for light. Blue bounces around the most, painting the whole sky.",
    speed: 2.3,
    score: 8.1,
  },
] as const

const TICK_MS = 28
const BEST = COLUMNS.reduce((best, c, i) => (c.score > COLUMNS[best]!.score ? i : best), 0)

export function ArenaPreview() {
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { once: true, amount: 0.3 })
  // Gate on mount so server and hydration markup match for reduced-motion users.
  const prefersReduced = useReducedMotion()
  const mounted = useMounted()
  const reduceMotion = mounted && prefersReduced === true
  const [tick, setTick] = useState(0)
  const maxTicks = Math.max(...COLUMNS.map((c) => Math.ceil(c.text.length / c.speed)))
  const finished = reduceMotion || tick >= maxTicks

  useEffect(() => {
    if (!inView || reduceMotion) return
    const id = setInterval(() => {
      setTick((t) => {
        if (t >= maxTicks) clearInterval(id)
        return Math.min(t + 1, maxTicks)
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [inView, reduceMotion, maxTicks])

  return (
    <div ref={root} className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Task</span>
        <p className="min-w-0 flex-1 truncate text-sm">{TASK}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-xs">
          <ProviderIcon provider="deepseek" className="size-3" />
          DeepSeek V4 Flash
        </span>
      </div>

      <div className="scrollbar-none overflow-x-auto">
        <div className="grid min-w-[60rem] grid-cols-5 divide-x divide-border lg:min-w-0">
          {BUILT_IN_STRATEGIES.map((strategy, i) => {
            const column = COLUMNS[i]!
            const shown = finished ? column.text.length : Math.min(column.text.length, Math.floor(tick * column.speed))
            const streaming = !finished && inView && shown < column.text.length
            const done = shown >= column.text.length
            const color = strategyColor(strategy.color)
            return (
              <div key={strategy.slug} className="flex min-w-0 flex-col">
                <span aria-hidden="true" className="block h-0.5" style={{ backgroundColor: color }} />
                <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
                  <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium">
                    <span style={{ color }}>
                      <StrategyIcon icon={strategy.icon} />
                    </span>
                    <span className="truncate">{strategy.name}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn('size-1.5 shrink-0 rounded-full transition-colors', streaming ? 'animate-pulse bg-primary' : done ? 'bg-success' : 'bg-border-strong')}
                  />
                </div>
                <p className="h-56 overflow-hidden whitespace-pre-line px-4 text-[13px] leading-relaxed text-foreground/90">
                  {column.text.slice(0, shown)}
                  {streaming && <span className="streaming-caret" />}
                </p>
                <div className="flex h-11 items-center justify-between gap-2 border-t border-border px-4">
                  <AnimatePresence>
                    {finished && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                        className="flex w-full items-center justify-between"
                      >
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <Scale aria-hidden="true" className="size-3" />
                          <span className="text-foreground">{column.score}</span>/10
                        </span>
                        {i === BEST && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-primary">
                            <Crown aria-hidden="true" className="size-3" />
                            Best
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
