import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

/**
 * One BrowserRouter for the whole application (Annex A, P0.1), with the
 * shared login state above the routes so every page reads the same value.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
