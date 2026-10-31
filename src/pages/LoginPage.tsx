import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import FormField from '../components/ui/FormField'
import { useAuth } from '../context/auth-context'
import type { LoginFormErrors, LoginFormValues } from '../types/user'
import { hasErrors, validateLogin } from '../utils/validation'

const EMPTY_FORM: LoginFormValues = { username: '', password: '' }

/**
 * Annex A, P1. A controlled React form: every input's value comes from state
 * and every keystroke goes through onChange, so React is the single source of
 * truth for what the form contains.
 *
 * No credentials are checked against anything. Any non-empty username with a
 * password of at least six characters signs in (A1.6, PRD rule 6).
 */
export default function LoginPage() {
  const [values, setValues] = useState<LoginFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<LoginFormErrors>({})

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Where to go after signing in: back to the guarded page that sent the user
   * here, otherwise the catalogue (P1.3).
   */
  const redirectTo =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/'

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // Clear this field's message as soon as the user starts correcting it.
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateLogin(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    login(values.username)
    navigate(redirectTo, { replace: true })
  }

  return (
    // Centred in the space the layout leaves, so the form sits in the middle
    // of the screen rather than at the top of a tall empty band.
    <Container className="flex flex-1 flex-col justify-center py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Log in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign in to place your order.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <FormField
            id="username"
            name="username"
            label="Username"
            type="text"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            error={errors.username}
          />

          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            className="mt-5"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Button type="submit" fullWidth className="mt-8">
            Log In
          </Button>
        </form>

        <Link
          to="/"
          className="mt-4 inline-flex min-h-11 items-center rounded-sm text-sm text-neutral-600 underline underline-offset-2 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
        >
          &larr; Back to catalog
        </Link>
      </div>
    </Container>
  )
}
