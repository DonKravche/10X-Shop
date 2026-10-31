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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return

    const nextErrors = validateLogin(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setIsSubmitting(true)
    // A username claimed through sign up is held to its password; anything
    // else signs in, which is what A1.6 requires of this demo.
    const result = await login(values.username, values.password)

    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      setIsSubmitting(false)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    // Centred in the space the layout leaves, so the form sits in the middle
    // of the screen rather than at the top of a tall empty band.
    <Container className="flex flex-1 flex-col justify-center py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Log in</h1>
        <p className="mt-1 text-sm text-subtle">
          Sign in to place your order.
        </p>
        <p className="mt-3 text-sm text-muted">
          This is a demo shop, so any username works. If you created an
          account here, use the password you chose.
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

          <Button type="submit" fullWidth disabled={isSubmitting} className="mt-8">
            Log In
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          No account yet?{' '}
          <Link
            to="/signup"
            // Carries the guarded destination through, so signing up from
            // here still returns the visitor to checkout.
            state={location.state}
            className="rounded-sm font-medium text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Create one
          </Link>
        </p>

        <Link
          to="/"
          className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          &larr; Back to catalog
        </Link>
      </div>
    </Container>
  )
}
