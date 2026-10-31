import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser, LoginResult, SignUpResult, StoredAccount } from '../types/user'
import { hashPassword } from '../utils/password'
import { AuthContext, GUEST } from './auth-context'

/** Annex A1.5 names this key for local user data. */
const STORAGE_KEY = 'shop_user'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Narrows one parsed value to a StoredAccount.
 *
 * Everything read back from localStorage is `unknown` until it has been
 * checked: JSON carries no types, and `shop_user` can be hand-edited or left
 * over from an older build. Without this a malformed record would reach the
 * sign-in comparison as `undefined`.
 */
function isStoredAccount(value: unknown): value is StoredAccount {
  if (typeof value !== 'object' || value === null) return false
  const account = value as Record<string, unknown>
  return (
    typeof account.username === 'string' &&
    account.username.length > 0 &&
    typeof account.passwordHash === 'string' &&
    account.passwordHash.length > 0
  )
}

/** Reads the claimed accounts, falling back to none on anything unexpected. */
function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isStoredAccount)
  } catch {
    // Corrupt JSON, or storage blocked in a private window: behave as though
    // nobody has signed up rather than taking the application down.
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    // Storage can be full or blocked. The sign-up still signs the visitor in
    // for this session, so failing to save must not break the page.
  }
}

/** Usernames are compared case-insensitively, as people expect of a login. */
function findAccount(accounts: StoredAccount[], username: string) {
  const wanted = username.trim().toLowerCase()
  return accounts.find((account) => account.username.toLowerCase() === wanted)
}

/**
 * Holds the login state for the whole application.
 *
 * Annex A, P0.2 allows the signed-in state to be lost on refresh, so the
 * current session is React state only. The accounts registry is different:
 * a sign-up that disappeared on reload would not be a sign-up, so that part
 * is persisted.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(GUEST)

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      const trimmed = username.trim()
      const account = findAccount(readAccounts(), trimmed)

      if (account !== undefined) {
        // A claimed username is held to the password it was claimed with.
        let attempted: string
        try {
          attempted = await hashPassword(password)
        } catch (error) {
          return {
            ok: false,
            field: 'password',
            message: error instanceof Error ? error.message : 'Could not sign you in.',
          }
        }

        if (attempted !== account.passwordHash) {
          return { ok: false, field: 'password', message: 'Incorrect password' }
        }

        setUser({ username: account.username, isLoggedIn: true })
        return { ok: true }
      }

      // Not claimed: sign in anyway. A1.6 requires any non-empty username to
      // work, and the CORE Measurable Outcome for P1 is written around it.
      setUser({ username: trimmed, isLoggedIn: true })
      return { ok: true }
    },
    [],
  )

  const signUp = useCallback(
    async (username: string, password: string): Promise<SignUpResult> => {
      const trimmed = username.trim()
      const accounts = readAccounts()

      if (findAccount(accounts, trimmed) !== undefined) {
        return {
          ok: false,
          field: 'username',
          message: 'That username is already taken',
        }
      }

      let passwordHash: string
      try {
        passwordHash = await hashPassword(password)
      } catch (error) {
        return {
          ok: false,
          field: 'password',
          message:
            error instanceof Error ? error.message : 'Could not create the account.',
        }
      }

      writeAccounts([...accounts, { username: trimmed, passwordHash }])
      setUser({ username: trimmed, isLoggedIn: true })
      return { ok: true }
    },
    [],
  )

  /** Returns to the guest state. The cart is deliberately untouched (P0.3). */
  const logout = useCallback(() => {
    setUser(GUEST)
  }, [])

  const value = useMemo(
    () => ({ user, login, signUp, logout }),
    [user, login, signUp, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
