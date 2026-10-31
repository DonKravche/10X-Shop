import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import FormField from '../components/ui/FormField'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/auth-context'
import { useCart } from '../context/cart-context'
import { useTheme } from '../context/theme-context'
import { useToast } from '../context/toast-context'
import { cartStorage, orderStorage, reviewStorage } from '../models/storage'
import { readOrders } from '../models/Order'
import type { ProfileFormErrors, ProfileFormValues } from '../utils/validation'
import { hasErrors, validateProfile } from '../utils/validation'

/**
 * Annex A, P7. The profile.
 *
 * Everything here is local (PRD rule 6): there is no user endpoint to read
 * from or write to, so the form edits React state and the theme and the
 * stored data are the only things that outlive the session.
 */
export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { clear } = useCart()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [orderCount, setOrderCount] = useState(
    () => readOrders(orderStorage.get()).length,
  )

  const [values, setValues] = useState<ProfileFormValues>({
    firstName: user.username,
    lastName: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<ProfileFormErrors>({})

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateProfile(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    showToast('Profile updated')
  }

  /**
   * Annex A, P7: clears the cart, the orders and the reviews, and keeps the
   * session and the theme. Destructive, so it asks first.
   */
  function handleClearData() {
    if (!window.confirm('Clear your cart, orders and reviews? This cannot be undone.')) {
      return
    }

    clear()
    cartStorage.remove()
    orderStorage.remove()
    reviewStorage.remove()
    setOrderCount(0)
    showToast('Local data cleared')
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <Container className="py-8">
      <PageHeader title="Profile" description={`Signed in as ${user.username}`} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-base font-medium text-ink">Your details</h2>
            <p className="mt-1 text-sm text-subtle">
              Kept in this browser for the session. Nothing is sent anywhere.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                id="firstName"
                name="firstName"
                label="First name"
                type="text"
                autoComplete="given-name"
                value={values.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              <FormField
                id="lastName"
                name="lastName"
                label="Last name"
                type="text"
                autoComplete="family-name"
                value={values.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />
              <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                className="sm:col-span-2"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
              />
              <FormField
                id="phone"
                name="phone"
                label="Phone (optional)"
                type="tel"
                autoComplete="tel"
                className="sm:col-span-2"
                value={values.phone}
                onChange={handleChange}
                error={errors.phone}
              />
            </div>
          </div>

          <Button type="submit" className="mt-6">
            Save changes
          </Button>
        </form>

        <aside className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-base font-medium text-ink">Orders</h2>
            <p className="mt-2 text-sm text-muted">
              {orderCount === 0
                ? 'No orders placed yet.'
                : `${orderCount} ${orderCount === 1 ? 'order' : 'orders'} placed.`}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-base font-medium text-ink">Appearance</h2>
            <p className="mt-2 text-sm text-muted">
              Currently {theme}.
            </p>
            {/* The same ThemeContext the header uses - P7 is explicit that a
                second implementation must not exist. */}
            <Button variant="secondary" onClick={toggleTheme} className="mt-4">
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </Button>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-base font-medium text-ink">Local data</h2>
            <p className="mt-2 text-sm text-muted">
              Removes the cart, the orders and the reviews saved in this browser.
              Your session and your theme are kept.
            </p>
            <Button variant="secondary" onClick={handleClearData} className="mt-4">
              Clear local data
            </Button>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-base font-medium text-ink">Session</h2>
            <Button variant="secondary" onClick={handleLogout} className="mt-4">
              Log out
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  )
}
