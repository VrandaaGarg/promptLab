import { LogOut } from 'lucide-react'
import { Popover } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useSignOut } from '@/hooks/use-auth-actions'
import type { SessionUser } from '@/server/middleware'

function initials(name: string, email: string) {
  const source = name.trim() || email
  const parts = source.split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : source.slice(0, 2)
  return letters.toUpperCase()
}

export function UserMenu({ user }: { user: SessionUser }) {
  const { signOut, pending } = useSignOut()

  return (
    <Popover
      label="Account"
      align="end"
      className="w-64"
      trigger={
        <button
          type="button"
          aria-label={`Account menu for ${user.name || user.email}`}
          className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary transition-colors hover:bg-border"
        >
          {initials(user.name, user.email)}
        </button>
      }
    >
      <div className="px-2.5 py-2">
        <p className="truncate text-sm font-medium">{user.name || 'Signed in'}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Separator className="my-1" />
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={pending}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        {pending ? <Spinner className="size-4" /> : <LogOut aria-hidden="true" className="size-4 text-muted-foreground" />}
        Sign out
      </button>
    </Popover>
  )
}
