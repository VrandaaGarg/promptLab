import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { CategoryFilter, ModelFilter } from '@/components/common/filter-selects'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import type { TaskCategory } from '@/lib/domain'
import type { ModelId } from '@/lib/models'

export type HistoryFilters = { search?: string; category?: TaskCategory; model?: ModelId }

export function HistoryToolbar({
  filters,
  onChange,
}: {
  filters: HistoryFilters
  onChange: (patch: HistoryFilters) => void
}) {
  const [search, setSearch] = useState(filters.search ?? '')
  // Resync the draft when the URL changes from elsewhere (e.g. "Clear filters"), without
  // clobbering what the user is typing while a debounced update is in flight.
  const [committed, setCommitted] = useState(filters.search)
  if (filters.search !== committed) {
    setCommitted(filters.search)
    if ((filters.search ?? '') !== search.trim()) setSearch(filters.search ?? '')
  }
  const commitSearch = useDebouncedCallback((value: string) => onChange({ search: value.trim() || undefined }), 300)

  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search tasks"
          placeholder="Search tasks…"
          value={search}
          maxLength={200}
          onChange={(e) => {
            setSearch(e.target.value)
            commitSearch(e.target.value)
          }}
          className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearch('')
              onChange({ search: undefined })
            }}
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <CategoryFilter value={filters.category} onChange={(category) => onChange({ category })} />
        <ModelFilter value={filters.model} onChange={(model) => onChange({ model })} />
      </div>
    </div>
  )
}
