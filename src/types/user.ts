/**
 * Login models (Annex A1.5).
 *
 * Login is a local simulation held in React Context (PRD rule 6): there is no
 * auth API, no JWT and no token, so nothing here describes a server session.
 */

export interface AuthUser {
  username: string
  isLoggedIn: boolean
}

export interface LoginFormValues {
  username: string
  password: string
}

/** One optional message per field, keyed by the field it belongs to. */
export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>
