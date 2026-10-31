import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AuthUser,
  LoginResult,
  SignUpResult,
  StoredAccount,
  UserStore,
} from '../types/user'
import { userStorage } from '../models/storage'
import { hashPassword } from '../utils/password'
import { AuthContext, GUEST } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

const EMPTY_STORE: UserStore = { accounts: [], session: null }

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

/** The stored accounts and session, with anything unexpected dropped. */
function readStore(): UserStore {
  const raw: unknown = userStorage.get()
  if (typeof raw !== 'object' || raw === null) return EMPTY_STORE

  // An earlier build wrote a bare array of accounts under this key. Reading
  // it rather than discarding it means a sign-up made before this change
  // survives instead of silently disappearing.
  if (Array.isArray(raw)) {
    return { accounts: raw.filter(isStoredAccount), session: null }
  }

  const store = raw as Partial<UserStore>
  return {
    accounts: Array.isArray(store.accounts)
      ? store.accounts.filter(isStoredAccount)
      : [],
    session:
      typeof store.session === 'string' && store.session !== '' ? store.session : null,
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
 * The session is restored on load. P0.2 allows it to be lost on refresh but
 * does not require that, and Orders and Profile are guarded routes whose data
 * outlives the tab: without persistence a shopper would be sent to the login
 * page every time they reloaded their own order history.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(() => {
    const { session } = readStore()
    return session === null ? GUEST : { username: session, isLoggedIn: true }
  })

  /** Signs in and records it, so a reload does not undo it. */
  const startSession = useCallback((username: string) => {
    const store = readStore()
    userStorage.set({ ...store, session: username })
    setUser({ username, isLoggedIn: true })
  }, [])

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      const trimmed = username.trim()
      const account = findAccount(readStore().accounts, trimmed)

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

        startSession(account.username)
        return { ok: true }
      }

      // Not claimed: sign in anyway. A1.6 requires any non-empty username to
      // work, and the CORE Measurable Outcome for P1 is written around it.
      startSession(trimmed)
      return { ok: true }
    },
    [startSession],
  )

  const signUp = useCallback(
    async (username: string, password: string): Promise<SignUpResult> => {
      const trimmed = username.trim()
      const store = readStore()

      if (findAccount(store.accounts, trimmed) !== undefined) {
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

      userStorage.set({
        accounts: [...store.accounts, { username: trimmed, passwordHash }],
        session: trimmed,
      })
      setUser({ username: trimmed, isLoggedIn: true })
      return { ok: true }
    },
    [],
  )

  /**
   * Returns to the guest state. The claimed accounts stay - signing out is
   * not deleting an account - and the cart is untouched (P0.3).
   */
  const logout = useCallback(() => {
    const store = readStore()
    userStorage.set({ ...store, session: null })
    setUser(GUEST)
  }, [])

  const value = useMemo(
    () => ({ user, login, signUp, logout }),
    [user, login, signUp, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
