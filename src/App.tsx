import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import CartProvider from './context/CartContext'
import ThemeProvider from './context/ThemeContext'
import ToastProvider from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

/**
 * One BrowserRouter for the whole application (Annex A, P0.1), with the
 * shared state above the routes so every page reads the same values.
 *
 * The order is deliberate: the theme wraps everything because it paints the
 * page, toasts sit above the screens so any of them can raise one, and the
 * cart sits inside auth because signing out must leave the cart alone (P0.3).
 */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
