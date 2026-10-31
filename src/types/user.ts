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

/** Sign up asks for the password twice (Annex A, P1.1 — FULL). */
export interface SignUpFormValues {
  username: string
  password: string
  confirmPassword: string
}

export type SignUpFormErrors = Partial<Record<keyof SignUpFormValues, string>>

/**
 * One account claimed through the sign-up form, as it is kept in
 * localStorage under `shop_user`.
 *
 * The password itself is never stored - only a SHA-256 digest of it, so the
 * saved record cannot be read back as a password. That makes this a better
 * simulation, not real security: see `utils/password.ts`.
 */
export interface StoredAccount {
  username: string
  passwordHash: string
}

/**
 * What a sign-in or sign-up attempt produced. `field` says which input the
 * message belongs under, so the form can show it in the right place rather
 * than as a banner.
 *
 * The field name is a type parameter so each form only hears about its own
 * inputs: sign-in can be told about `username` or `password`, and only sign
 * up can be told about `confirmPassword`. Without that, every caller would
 * have to handle a field it does not render.
 */
export type AuthResult<Field extends string> =
  | { ok: true }
  | { ok: false; field: Field; message: string }

/** Sign-in can only fail on a field the login form actually shows. */
export type LoginResult = AuthResult<keyof LoginFormValues>

export type SignUpResult = AuthResult<keyof SignUpFormValues>
