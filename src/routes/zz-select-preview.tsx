import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CategoryFilter, ModelFilter } from '@/components/common/filter-selects'
import { CompareDialog } from '@/components/run/compare-dialog'
import type { TaskCategory } from '@/lib/domain'
import type { ModelId } from '@/lib/models'
import type { RunResponse } from '@/server/runs'

export const Route = createFileRoute('/zz-select-preview')({ component: Preview })

const mk = (id: string, strategyName: string, color: string, icon: string, output: string) =>
  ({ id, strategyName, color, icon, output, status: 'done' }) as unknown as RunResponse
const responses = [
  mk('a', 'Zero-shot', 'strategy-1', 'zap', 'The quick brown fox jumps over the lazy dog.'),
  mk('b', 'Chain of thought', 'strategy-3', 'brain', 'The quick red fox leaps over the sleepy dog.'),
  mk('c', 'Expert persona', 'strategy-5', 'user-round', 'A fast brown fox jumps over a lazy dog.'),
]

function Preview() {
  const [open, setOpen] = useState(true)
  const [blind, setBlind] = useState(false)
  const [category, setCategory] = useState<TaskCategory | undefined>()
  const [model, setModel] = useState<ModelId | undefined>()
  return (
    <div className="space-y-4 p-8">
      <div className="flex gap-2">
        <CategoryFilter value={category} onChange={setCategory} />
        <ModelFilter value={model} onChange={setModel} />
      </div>
      <p id="state">{`category=${category ?? '-'} model=${model ?? '-'} dialog=${open}`}</p>
      <button type="button" onClick={() => setOpen(true)}>open</button>
      <button type="button" onClick={() => setBlind((b) => !b)}>blind</button>
      <CompareDialog
        open={open}
        onOpenChange={setOpen}
        responses={responses}
        identityOf={(id) => ({ hidden: blind, letter: id.toUpperCase() })}
      />
    </div>
  )
}
