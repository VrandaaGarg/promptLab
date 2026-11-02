import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { LogoMark } from '@/components/common/logo'
import { PublicHeader } from '@/components/layout/public-header'
import { Card } from '@/components/ui/card'
import { fadeUp } from '@/lib/motion'

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="flex flex-1 items-start justify-center px-4 py-16 sm:items-center sm:py-12">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <LogoMark className="size-8" />
            <h1 className="mt-4 text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
          <Card className="p-6">{children}</Card>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </motion.div>
      </main>
    </div>
  )
}
