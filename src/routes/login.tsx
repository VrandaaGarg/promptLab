import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/auth-layout'
import { SignInForm } from '@/components/auth/sign-in-form'
import { authSearchSchema } from '@/lib/auth/schemas'
import { safeRedirect } from '@/lib/auth/redirect'

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Sign in — PromptLab' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect: target } = Route.useSearch()
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue your experiments."
      footer={
        <>
          New to PromptLab?{' '}
          <Link to="/signup" search={{ redirect: target }} className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm redirect={target} />
    </AuthLayout>
  )
}
