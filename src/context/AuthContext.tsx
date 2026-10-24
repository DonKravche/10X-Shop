import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/user'
import { AuthContext, GUEST } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Holds the login state for the whole application.
 *
 * Annex A, P0.2 allows the login state to be lost on refresh, so nothing is
 * written to localStorage: session persistence is explicitly not CORE.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(GUEST)

  const login = useCallback((username: string) => {
    setUser({ username: username.trim(), isLoggedIn: true })
  }, [])

  /** Returns to the guest state. The cart is deliberately untouched (P0.3). */
  const logout = useCallback(() => {
    setUser(GUEST)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}
