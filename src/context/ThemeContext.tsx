import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { themeStorage } from '../models/storage'
import type { ThemeName } from '../types/theme'
import { ThemeContext } from './theme-context'

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * The saved theme, or the one the operating system asks for.
 *
 * Falling back to `prefers-color-scheme` rather than always to light means a
 * visitor who runs their machine dark is not flashed a white page before
 * they have expressed any preference here.
 */
function readTheme(): ThemeName {
  const stored = themeStorage.get()
  if (stored === 'light' || stored === 'dark') return stored

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeName>(readTheme)

  // The attribute on <html> is what the CSS keys off, and the stored value is
  // what the next visit reads (A1.5, P0.3).
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    themeStorage.set(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
