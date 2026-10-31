import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import CartProvider from './context/CartContext'
import ToastProvider from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

/**
 * One BrowserRouter for the whole application (Annex A, P0.1), with the
 * shared login and cart state above the routes so every page reads the same
 * values.
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Toasts sit outermost so any screen can raise one. */}
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
