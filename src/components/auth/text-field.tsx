import type { ChangeEvent, HTMLInputAutoCompleteAttribute } from 'react'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

export type TextFieldProps = {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  type?: 'text' | 'email' | 'password'
  autoComplete?: HTMLInputAutoCompleteAttribute
  placeholder?: string
  autoFocus?: boolean
}

/** Labelled input wired to a TanStack Form field's primitive state. */
export function TextField({ name, label, value, onChange, onBlur, error, type = 'text', ...props }: TextFieldProps) {
  const inputProps = {
    name,
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    onBlur,
    ...props,
  }

  return (
    <Field label={label} error={error}>
      {type === 'password' ? <PasswordInput {...inputProps} /> : <Input type={type} {...inputProps} />}
    </Field>
  )
}
