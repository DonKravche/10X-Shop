import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Annex A, P0.2. A teaching-grade guard, not real authorisation.
 *
 * It reads the boolean in AuthContext and, for a guest, redirects to /login
 * while remembering where the user was heading, so signing in returns them to
 * the page they wanted instead of dropping them on the catalogue.
 *
 * `replace` keeps the guarded URL out of the history stack, so the browser's
 * Back button does not bounce the user between /checkout and /login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user.isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <>{children}</>
}
