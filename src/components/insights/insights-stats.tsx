import { Coins, FlaskConical, Hash, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { StatCard } from '@/components/ui/stat-card'
import { formatCost, formatNumber, formatTokens } from '@/lib/format'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { Insights } from '@/server/insights'

export function InsightsStats({ totals }: { totals: Insights['totals'] }) {
  const stats = [
    {
      label: 'Total runs',
      value: formatNumber(totals.runs),
      hint: `${formatNumber(totals.responses)} responses`,
      icon: <FlaskConical className="size-4" />,
    },
    {
      label: 'Responses rated',
      value: formatNumber(totals.rated),
      hint: `${formatNumber(totals.judged)} scored by the AI judge`,
      icon: <Star className="size-4" />,
    },
    {
      label: 'Total cost',
      value: formatCost(totals.totalCost),
      hint: totals.responses ? `${formatCost(totals.totalCost / totals.responses)} per response` : undefined,
      icon: <Coins className="size-4" />,
    },
    {
      label: 'Total tokens',
      value: formatTokens(totals.totalTokens),
      hint: 'Input and output combined',
      icon: <Hash className="size-4" />,
    },
  ]

  return (
    <motion.div
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {stats.map((s) => (
        <motion.div key={s.label} variants={fadeUp}>
          <StatCard label={s.label} value={s.value} hint={s.hint} icon={s.icon} className="h-full" />
        </motion.div>
      ))}
    </motion.div>
  )
}
