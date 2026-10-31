import { Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import CartPage from '../pages/CartPage'
import CatalogPage from '../pages/CatalogPage'
import CheckoutPage from '../pages/CheckoutPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProductPage from '../pages/ProductPage'
import SignUpPage from '../pages/SignUpPage'
import ProtectedRoute from './ProtectedRoute'

/**
 * The CORE route map (Annex A1.2).
 *
 * Every route is nested inside the single Layout route, so the header and the
 * footer are mounted once and survive navigation.
 *
 * /orders, /orders/:id and /profile belong to FULL and are not routed.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        {/* P1.1 lists Sign Up under FULL. */}
        <Route path="signup" element={<SignUpPage />} />
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
