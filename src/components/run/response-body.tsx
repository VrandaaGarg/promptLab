import { CircleAlert } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { RunResponse } from '@/server/runs'

const SKELETON_WIDTHS = ['w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3', 'w-5/6', 'w-1/2']
const STICK_THRESHOLD_PX = 32

/** Scrollable, readable output that follows the stream unless the reader scrolls away from the bottom. */
export function ResponseBody({
  response,
  compact = false,
}: {
  response: Pick<RunResponse, 'status' | 'output' | 'error'>
  /** Fixed-height, smaller-type variant for the side-by-side grid. */
  compact?: boolean
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  const streaming = response.status === 'streaming'

  useLayoutEffect(() => {
    const el = scroller.current
    if (el && streaming && stick.current) el.scrollTop = el.scrollHeight
  }, [response.output, streaming])

  return (
    <div
      ref={scroller}
      tabIndex={0}
      aria-label="Response output"
      aria-busy={streaming || response.status === 'pending'}
      onScroll={(event) => {
        const el = event.currentTarget
        stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX
      }}
      className={cn(
        'overflow-y-auto focus-visible:outline-offset-[-2px]',
        compact ? 'h-80 px-4 py-4' : 'max-h-[min(70vh,52rem)] min-h-64 rounded-b-lg px-4 py-5 sm:px-6',
      )}
    >
      <div className="max-w-[75ch]">
        {response.status === 'pending' ? (
          <div className="space-y-3 pt-1" aria-label="Waiting for the model">
            {SKELETON_WIDTHS.map((width, i) => (
              <Skeleton key={i} className={`h-3.5 ${width}`} />
            ))}
          </div>
        ) : (
          <>
            {response.status === 'error' && (
              <p className="mb-4 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {response.error ?? 'Generation failed.'}
              </p>
            )}
            {response.output ? (
              <Markdown
                streaming={streaming}
                className={
                  compact
                    ? 'leading-6 prose-headings:mb-2 prose-headings:mt-4 prose-h1:text-base prose-h2:text-base prose-h3:text-sm'
                    : 'leading-7 sm:prose-base sm:leading-7 prose-headings:mb-2 prose-headings:mt-6 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base'
                }
              >
                {response.output}
              </Markdown>
            ) : streaming ? (
              <span className="streaming-caret" aria-hidden="true" />
            ) : response.status === 'done' ? (
              <p className="text-sm italic text-muted-foreground">The model returned no output.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
