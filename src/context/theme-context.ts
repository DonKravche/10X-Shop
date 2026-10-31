import { createContext, useContext } from 'react'
import type { ThemeName } from '../types/theme'

/**
 * Light or dark, shared by the header switch and the profile page
 * (Annex A, P0.4 and P7).
 *
 * One context so there is exactly one implementation: P7's registry is
 * explicit that the profile's switch is the same control as the header's,
 * not a second one that could drift out of step.
 */
export interface ThemeContextValue {
  theme: ThemeName
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (value === null) {
    throw new Error('useTheme must be used inside a ThemeProvider')
  }
  return value
}
