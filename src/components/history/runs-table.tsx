import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table'
import { Link, useNavigate } from '@tanstack/react-router'
import { CategoryBadge } from '@/components/common/category-badge'
import { ModelLabel } from '@/components/common/model-badge'
import { RelativeTime } from '@/components/common/relative-time'
import { StrategyName } from '@/components/common/strategy-name'
import { cn } from '@/lib/utils'
import type { RunListItem } from '@/server/runs'
import { RatingValue } from '@/components/common/rating-value'

const features = tableFeatures({})
const column = createColumnHelper<typeof features, RunListItem>()

const columns = column.columns([
  column.accessor('task', {
    header: 'Task',
    cell: (info) => (
      <Link
        to="/runs/$runId"
        params={{ runId: info.row.original.id }}
        onClick={(e) => e.stopPropagation()}
        title={info.getValue()}
        className="line-clamp-2 font-medium text-foreground underline-offset-4 hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  column.accessor('category', {
    header: 'Category',
    cell: (info) =>
      info.getValue() ? <CategoryBadge category={info.getValue()} /> : <span className="text-muted-foreground">—</span>,
  }),
  column.accessor('model', { header: 'Model', cell: (info) => <ModelLabel model={info.getValue()} /> }),
  column.accessor('strategyCount', {
    header: 'Strategies',
    cell: (info) => <span className="font-mono tabular-nums">{info.getValue()}</span>,
  }),
  column.accessor('avgRating', { header: 'Avg rating', cell: (info) => <RatingValue value={info.getValue()} /> }),
  column.accessor('winner', { header: 'Your pick', cell: (info) => <StrategyName name={info.getValue()} /> }),
  column.accessor('judgeTop', { header: "Judge's pick", cell: (info) => <StrategyName name={info.getValue()} /> }),
  column.accessor('createdAt', {
    header: 'Date',
    cell: (info) => <RelativeTime date={info.getValue()} className="text-muted-foreground" />,
  }),
])

const COLUMN_CLASSES: Record<string, string> = {
  task: 'w-[34%] min-w-64',
  strategyCount: 'text-right',
  createdAt: 'text-right',
}

export function RunsTable({ runs }: { runs: RunListItem[] }) {
  const table = useTable({ features, columns, data: runs })
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b border-border">
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted-foreground',
                    COLUMN_CLASSES[header.column.id],
                  )}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => void navigate({ to: '/runs/$runId', params: { runId: row.original.id } })}
              className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface-2/60"
            >
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className={cn('px-4 py-3 align-middle', COLUMN_CLASSES[cell.column.id])}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
