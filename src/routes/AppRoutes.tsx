import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import LandingPage from '../pages/LandingPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProtectedRoute from './ProtectedRoute'

/*
 * Route-level code splitting (Annex A, O1).
 *
 * Each lazy page becomes its own chunk, fetched the first time its route is
 * opened: the code for Orders is not downloaded by someone who only browses
 * the catalogue. Network shows one request per route on first visit.
 *
 * The landing page and Not found are imported eagerly on purpose. The landing
 * page is the entry point, so splitting it would only add a round trip before
 * the first paint, and Not found is rendered *by* other pages for a bad id -
 * it has to be there already rather than arriving after a second request.
 */
const CatalogPage = lazy(() => import('../pages/CatalogPage'))
const ProductPage = lazy(() => import('../pages/ProductPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const SignUpPage = lazy(() => import('../pages/SignUpPage'))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'))
const OrdersPage = lazy(() => import('../pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))

/**
 * The route map (Annex A1.2).
 *
 * Every route is nested inside the single Layout route, so the header and the
 * footer are mounted once and survive navigation. /orders, /orders/:id,
 * /profile and /checkout are guarded.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        {/* P1.1 lists Sign Up under FULL. */}
        <Route path="signup" element={<SignUpPage />} />
        {/* P6 and P7, FULL: guarded like checkout. */}
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
