import { CircleAlert } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import type { RunResponse } from '@/server/runs'

const SKELETON_WIDTHS = ['w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3', 'w-5/6', 'w-1/2']
const STICK_THRESHOLD_PX = 32

/** Scrollable output that follows the stream unless the reader scrolls away from the bottom. */
export function ResponseBody({ response }: { response: Pick<RunResponse, 'status' | 'output' | 'error'> }) {
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
      className="h-80 overflow-y-auto px-4 pb-4 outline-none focus-visible:bg-surface-2/40 lg:h-[26rem]"
    >
      {response.status === 'pending' ? (
        <div className="space-y-2.5 pt-1">
          {SKELETON_WIDTHS.map((width, i) => (
            <Skeleton key={i} className={`h-3 ${width}`} />
          ))}
        </div>
      ) : (
        <>
          {response.status === 'error' && (
            <p className="mb-3 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive">
              <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              {response.error ?? 'Generation failed.'}
            </p>
          )}
          {response.output ? (
            <Markdown streaming={streaming} className="prose-headings:mb-2 prose-headings:mt-4 prose-h1:text-base prose-h2:text-[15px] prose-h3:text-sm">
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
  )
}
