import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; resolvedTheme: ResolvedTheme; setTheme: (theme: Theme) => void }
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [ready, setReady] = useState(false)
  useEffect(() => { try { const stored = localStorage.getItem('promptlab-theme'); if (stored === 'light' || stored === 'dark' || stored === 'system') setThemeState(stored) } catch {} setReady(true) }, [])
  useEffect(() => {
    if (!ready) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme; setResolvedTheme(resolved); document.documentElement.classList.toggle('dark', resolved === 'dark'); document.documentElement.style.colorScheme = resolved }
    apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply)
  }, [theme, ready])
  const setTheme = useCallback((value: Theme) => { setThemeState(value); try { localStorage.setItem('promptlab-theme', value) } catch {} }, [])
  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
}
export function useTheme() { const value = useContext(ThemeContext); if (!value) throw new Error('useTheme must be used within ThemeProvider'); return value }
