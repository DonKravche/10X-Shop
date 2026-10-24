import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

/**
 * One BrowserRouter for the whole application (Annex A, P0.1).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
