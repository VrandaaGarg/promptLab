import { useForm, useStore } from '@tanstack/react-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCompleteAuth } from '@/hooks/use-auth-actions'
import { signUp } from '@/lib/auth/client'
import { signUpSchema } from '@/lib/auth/schemas'
import { visibleFieldError } from '@/lib/form'
import { FormError } from './form-error'
import { TextField } from './text-field'

export function SignUpForm({ redirect }: { redirect?: string }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const completeAuth = useCompleteAuth(redirect)

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    validators: { onChange: signUpSchema },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const { error } = await signUp.email({
        name: value.name.trim(),
        email: value.email,
        password: value.password,
      })
      if (error) {
        setServerError(error.message ?? 'Could not create your account. Please try again.')
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
      <form.Field name="name">
        {(field) => (
          <TextField
            name={field.name}
            label="Name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            autoFocus
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={visibleFieldError(field.state.meta, submitted)}
          />
        )}
      </form.Field>
      <form.Field name="email">
        {(field) => (
          <TextField
            name={field.name}
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
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
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
