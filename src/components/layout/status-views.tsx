import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { CircleAlert, Compass } from 'lucide-react'
import type { ReactNode } from 'react'
import { buttonVariants, Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

function Centered({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-[60vh] items-center justify-center px-4', className)}>{children}</div>
}

export function NotFound({ title = 'Page not found', description }: { title?: string; description?: string }) {
  return (
    <Centered>
      <EmptyState
        icon={<Compass className="size-5" />}
        title={title}
        description={description ?? "The page you're looking for doesn't exist or has moved."}
        action={
          <Link to="/" className={buttonVariants({ variant: 'outline' })}>
            Back to home
          </Link>
        }
      />
    </Centered>
  )
}

export function ErrorView({ error, reset, title = 'Something went wrong' }: ErrorComponentProps & { title?: string }) {
  const router = useRouter()
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
  return (
    <Centered>
      <EmptyState
        icon={<CircleAlert className="size-5" />}
        title={title}
        description={message}
        action={
          <Button
            variant="outline"
            onClick={() => {
              reset()
              void router.invalidate()
            }}
          >
            Try again
          </Button>
        }
      />
    </Centered>
  )
}
