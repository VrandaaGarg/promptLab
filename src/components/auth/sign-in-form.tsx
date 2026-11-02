import { useForm, useStore } from '@tanstack/react-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCompleteAuth } from '@/hooks/use-auth-actions'
import { signIn } from '@/lib/auth/client'
import { signInSchema } from '@/lib/auth/schemas'
import { visibleFieldError } from '@/lib/form'
import { FormError } from './form-error'
import { TextField } from './text-field'

export function SignInForm({ redirect }: { redirect?: string }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const completeAuth = useCompleteAuth(redirect)

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: signInSchema },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const { error } = await signIn.email({ email: value.email, password: value.password })
      if (error) {
        setServerError(error.message ?? 'Could not sign in. Please try again.')
        return
      }
      await completeAuth()
    },
  })
  const submitted = useStore(form.store, (state) => state.submissionAttempts > 0)

  return (
    <form
      noValidate
      method="post"
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FormError message={serverError} />
      <form.Field name="email">
        {(field) => (
          <TextField
            name={field.name}
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={visibleFieldError(field.state.meta, submitted)}
          />
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <TextField
            name={field.name}
            label="Password"
            type="password"
            autoComplete="current-password"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={visibleFieldError(field.state.meta, submitted)}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
