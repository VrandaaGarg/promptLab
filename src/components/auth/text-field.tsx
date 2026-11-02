import type { HTMLInputAutoCompleteAttribute } from 'react'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

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
  return (
    <Field label={label} error={error}>
      <Input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        {...props}
      />
    </Field>
  )
}
