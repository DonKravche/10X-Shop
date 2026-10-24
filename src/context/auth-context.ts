import { createContext, useContext } from 'react'
import type { AuthUser } from '../types/user'

/**
 * Login state shared across the application (Annex A, P0.2).
 *
 * This is a local simulation: `login` only records a username in React state.
 * No credentials are stored, hashed or sent anywhere (PRD rule 6).
 */
export interface AuthContextValue {
  user: AuthUser
  login: (username: string) => void
  logout: () => void
}

/** The signed-out state, used as the initial value and after logout. */
export const GUEST: AuthUser = { username: '', isLoggedIn: false }

export const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Reads the auth context, failing loudly when a component is rendered
 * outside AuthProvider rather than silently behaving as a guest.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (value === null) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return value
}
