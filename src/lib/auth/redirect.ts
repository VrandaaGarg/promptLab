const DEFAULT_AUTHED_PATH = '/arena'
const BASE = 'https://promptlab.invalid'

/**
 * Only allow same-origin relative paths as post-auth redirect targets. Control characters and
 * backslashes are rejected because URL parsing strips or rewrites them (e.g. "/\t/evil.com").
 */
export function safeRedirect(target: string | undefined): string {
  if (!target || !target.startsWith('/') || /[\u0000-\u001f\u007f\\]/.test(target)) return DEFAULT_AUTHED_PATH
  try {
    const url = new URL(target, BASE)
    if (url.origin !== BASE) return DEFAULT_AUTHED_PATH
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_AUTHED_PATH
  }
}
