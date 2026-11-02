import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/auth-layout'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { authSearchSchema } from '@/lib/auth/schemas'
import { safeRedirect } from '@/lib/auth/redirect'

export const Route = createFileRoute('/signup')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Create account — PromptLab' }] }),
  component: SignUpPage,
})

function SignUpPage() {
  const { redirect: target } = Route.useSearch()
  return (
    <AuthLayout
      title="Create your account"
      description="Start comparing prompting strategies in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" search={{ redirect: target }} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm redirect={target} />
    </AuthLayout>
  )
}
