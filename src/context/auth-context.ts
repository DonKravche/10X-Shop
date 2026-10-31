import { createContext, useContext } from 'react'
import type { AuthUser, LoginResult, SignUpResult } from '../types/user'

/**
 * Login state shared across the application (Annex A, P0.2).
 *
 * This is a local simulation: no credential ever leaves the browser and there
 * is no authentication server (PRD rule 6). Sign up (P1.1, FULL) adds a local
 * account registry on top of it, kept in `shop_user`.
 */
export interface AuthContextValue {
  user: AuthUser

  /**
   * Signs in and reports what happened.
   *
   * Two rules, in this order:
   *
   * 1. A username that was claimed through sign up must match the password it
   *    was claimed with, otherwise this returns an error on the password
   *    field. Sign up would mean nothing if the password it set were never
   *    checked.
   * 2. Any other non-empty username signs in. That is not an oversight: A1.6
   *    fixes it ("the system does not check a real account") and the CORE
   *    Measurable Outcome for P1 depends on it, so sign up must not take it
   *    away.
   */
  login: (username: string, password: string) => Promise<LoginResult>

  /**
   * Claims a username locally and signs in. Fails when the name is already
   * taken, which is the one thing a local registry can meaningfully enforce.
   */
  signUp: (username: string, password: string) => Promise<SignUpResult>

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
