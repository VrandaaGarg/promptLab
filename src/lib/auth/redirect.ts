export const DEFAULT_AUTHED_PATH = '/arena'

/** Only allow same-origin relative paths as post-auth redirect targets. */
export function safeRedirect(target: string | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')) {
    return target
  }
  return DEFAULT_AUTHED_PATH
}
