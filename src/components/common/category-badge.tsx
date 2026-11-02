import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS, type TaskCategory } from '@/lib/domain'

export function CategoryBadge({ category, className }: { category: TaskCategory | null; className?: string }) {
  if (!category) return null
  return (
    <Badge variant="outline" className={className}>
      {CATEGORY_LABELS[category]}
    </Badge>
  )
}
