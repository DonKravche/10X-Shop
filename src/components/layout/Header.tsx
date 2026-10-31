import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useCart } from '../../context/cart-context'
import { useTheme } from '../../context/theme-context'
import Container from '../ui/Container'
import HeaderSearch from './HeaderSearch'
import {
  CartIcon,
  LogOutIcon,
  MoonIcon,
  OrdersIcon,
  SunIcon,
  UserIcon,
} from '../ui/icons'

/*
 * Annex A, P0.3. The header is written once, inside Layout, and carries the
 * logo, search, Catalog, Cart and the login control. Orders, Profile and the
 * theme switch belong to FULL.
 *
 * Icons sit beside their words, not instead of them: an icon alone is a
 * guess, and the one control here that has no room for a word - the theme
 * switch - carries its name in aria-label instead.
 *
 * Below 640px the navigation wraps onto a second row rather than opening a
 * burger menu: P0.3 allows either, and a wrapped row cannot cause the
 * horizontal scrolling O3 forbids.
 */

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  [
    'inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive
      ? 'bg-ground font-medium text-ink'
      : 'text-muted hover:bg-ground hover:text-ink',
  ].join(' ')

const ICON_BUTTON =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted ' +
  'transition-colors hover:bg-ground hover:text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

export default function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  /** Returns to the guest state and goes home. The cart is kept (P0.3). */
  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-line bg-surface">
      <Container>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 py-3">
          <Link
            to="/"
            className="inline-flex min-h-11 shrink-0 items-center rounded-md text-lg font-bold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            10X Shop
          </Link>

          {/* Tablet and up; the catalogue's own field serves a phone. */}
          <div className="order-last w-full md:order-none md:ml-6 md:w-auto md:flex-1">
            <HeaderSearch />
          </div>

          <nav
            aria-label="Main"
            className="flex flex-1 items-center justify-end gap-1 md:flex-none"
          >
            <NavLink to="/catalog" className={linkClass}>
              Catalog
            </NavLink>

            <NavLink
              to="/cart"
              className={linkClass}
              // The count belongs in the name, not only in the badge: a
              // screen reader otherwise hears "Cart" and then a bare number.
              aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart, empty'}
            >
              <CartIcon size={18} />
              <span className="hidden sm:inline">Cart</span>
              {/* Hidden at zero rather than showing "0" (P0.3). */}
              {itemCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 py-0.5 text-xs font-medium tabular-nums text-surface">
                  {itemCount}
                </span>
              ) : null}
            </NavLink>

            {user.isLoggedIn ? (
              <>
                <NavLink to="/orders" className={linkClass} aria-label="Orders">
                  <OrdersIcon size={18} />
                  <span className="hidden lg:inline">Orders</span>
                </NavLink>
                <NavLink to="/profile" className={linkClass} aria-label="Profile">
                  <UserIcon size={18} />
                  <span className="hidden lg:inline">Profile</span>
                </NavLink>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
            )}

            {/*
              The one control with no word beside it, so its name lives in
              aria-label and the icon shows the theme it switches *to*.
            */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className={ICON_BUTTON}
            >
              {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>

            {user.isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className={ICON_BUTTON}
              >
                <LogOutIcon size={18} />
              </button>
            ) : null}
          </nav>
        </div>
      </Container>
    </header>
  )
}
