import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useCart } from '../../context/cart-context'
import { useTheme } from '../../context/theme-context'
import Container from '../ui/Container'
import HeaderSearch from './HeaderSearch'
import {
  CartIcon,
  CatalogIcon,
  CloseIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  OrdersIcon,
  SunIcon,
  UserIcon,
} from '../ui/icons'
import type { IconProps } from '../ui/icons'

/*
 * Annex A, P0.3. The header is written once, inside Layout, and carries the
 * logo, search, Catalog, Cart and the login control. Orders, Profile and the
 * theme switch belong to FULL.
 *
 * Icons sit beside their words, not instead of them: an icon alone is a
 * guess, and the one control here that has no room for a word - the theme
 * switch - carries its name in aria-label instead.
 *
 * Below 768px the navigation collapses behind one button. The row it
 * replaced put six controls on a 375px screen, which left the words off most
 * of them and the icons close enough together to mis-tap; P0.3 allows either
 * a wrapped row or a menu, and this is the one that still reads at that
 * width.
 */

/**
 * The destinations, written once.
 *
 * The bar and the menu show them very differently - one compact row of icons,
 * one column of full-width rows carrying their words - but they must never
 * offer different places to go, which is what happens when each keeps its
 * own list.
 */
interface NavItem {
  to: string
  label: string
  /**
   * Required, so the menu's icon column is never ragged. Adding a
   * destination without a mark is a compile error rather than one row whose
   * word starts 32px left of the others.
   */
  Icon: (props: IconProps) => JSX.Element
  /** The cart's count, which belongs in the link's accessible name. */
  count?: number
  /**
   * Shown as its icon alone in the bar until 1024px, where the search and
   * five destinations stop fitting side by side. Its word still has to reach
   * a screen reader, so a compact item names itself in `aria-label`. The menu
   * is never compact: it has the whole width of the screen for a row.
   */
  compact?: boolean
}

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  [
    'inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive
      ? 'bg-ground font-medium text-ink'
      : 'text-muted hover:bg-ground hover:text-ink',
  ].join(' ')

/** The same states, at the size a thumb needs and with room for the word. */
const menuLinkClass = ({ isActive }: { isActive: boolean }): string =>
  [
    'flex min-h-12 items-center gap-3 rounded-md px-3 text-base transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive
      ? 'bg-ground font-medium text-ink'
      : 'text-muted hover:bg-ground hover:text-ink',
  ].join(' ')

const ICON_BUTTON =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted ' +
  'transition-colors hover:bg-ground hover:text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

const MENU_BUTTON =
  'flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-base text-muted ' +
  'transition-colors hover:bg-ground hover:text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

export default function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Arriving somewhere is the end of using the menu. Without this the panel
  // would still be covering the page it was used to ask for.
  //
  // Closed during render rather than in an effect, the way the catalogue
  // adopts its URL: React re-runs this component immediately with the
  // corrected value and never commits the open panel to the screen. An
  // effect would paint it once over the new page and then close it.
  const locationKey = pathname + search
  const [lastLocation, setLastLocation] = useState(locationKey)

  if (lastLocation !== locationKey) {
    setLastLocation(locationKey)
    setMenuOpen(false)
  }

  // Escape closes it, as it closes every other layer on the web.
  useEffect(() => {
    if (!menuOpen) return

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  /** Returns to the guest state and goes home. The cart is kept (P0.3). */
  function handleLogout() {
    logout()
    navigate('/')
  }

  const cartLabel = itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart, empty'

  const items: NavItem[] = [
    { to: '/catalog', label: 'Catalog', Icon: CatalogIcon },
    { to: '/cart', label: 'Cart', Icon: CartIcon, count: itemCount },
    ...(user.isLoggedIn
      ? [
          { to: '/orders', label: 'Orders', Icon: OrdersIcon, compact: true },
          { to: '/profile', label: 'Profile', Icon: UserIcon, compact: true },
        ]
      : // UserIcon again, which is unambiguous because Log in and Profile are
        // the two halves of one slot: a guest never sees Profile and a
        // signed-in shopper never sees Log in.
        [{ to: '/login', label: 'Log in', Icon: UserIcon }]),
  ]

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

          {/* The whole navigation, from 768px up. */}
          <nav
            aria-label="Main"
            className="hidden flex-1 items-center justify-end gap-1 md:flex md:flex-none"
          >
            {items.map(({ to, label, Icon, count, compact }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
                // The count belongs in the name, not only in the badge: a
                // screen reader otherwise hears "Cart" and then a bare number.
                aria-label={to === '/cart' ? cartLabel : compact ? label : undefined}
              >
                <Icon size={18} />
                <span className={compact ? 'hidden lg:inline' : undefined}>
                  {label}
                </span>
                {/* Hidden at zero rather than showing "0" (P0.3). */}
                {count !== undefined && count > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 py-0.5 text-xs font-medium tabular-nums text-surface">
                    {count}
                  </span>
                ) : null}
              </NavLink>
            ))}

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

          {/*
            Below 768px, one button instead of that row. It names what it does
            and reports whether the panel is open, because the icon alone -
            three lines, or a cross - tells a screen reader nothing.
          */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={`${ICON_BUTTON} ml-auto md:hidden`}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </Container>

      {/*
        The panel pushes the page down rather than floating over it. A layer
        that covers the page needs a backdrop, a scroll lock and a focus trap
        to be honest about what it has taken over, and on a bar this short
        none of that buys anything a plain block of rows does not.
      */}
      {menuOpen ? (
        <div id="main-menu" className="border-t border-line md:hidden">
          <Container>
            <nav aria-label="Main" className="flex flex-col gap-1 py-3">
              {items.map(({ to, label, Icon, count }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={menuLinkClass}
                  aria-label={to === '/cart' ? cartLabel : undefined}
                >
                  <Icon size={20} />
                  {label}
                  {count !== undefined && count > 0 ? (
                    <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-ink px-2 py-0.5 text-sm font-medium tabular-nums text-surface">
                      {count}
                    </span>
                  ) : null}
                </NavLink>
              ))}

              <button type="button" onClick={toggleTheme} className={MENU_BUTTON}>
                {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
                Switch to {theme === 'dark' ? 'light' : 'dark'} theme
              </button>

              {user.isLoggedIn ? (
                <button type="button" onClick={handleLogout} className={MENU_BUTTON}>
                  <LogOutIcon size={20} />
                  Log out
                </button>
              ) : null}
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
