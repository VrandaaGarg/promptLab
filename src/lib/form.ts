// Helpers for presenting TanStack Form validation state.

type FieldMetaLike = { errors: ReadonlyArray<unknown>; isBlurred: boolean }

function messageOf(error: unknown): string | undefined {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return undefined
}

/**
 * First error message for a field, shown only once the user has left the field
 * or tried to submit, so errors don't flash while typing for the first time.
 */
export function visibleFieldError(meta: FieldMetaLike, submitted: boolean): string | undefined {
  if (!meta.isBlurred && !submitted) return undefined
  for (const error of meta.errors) {
    const message = messageOf(error)
    if (message) return message
  }
  return undefined
}
