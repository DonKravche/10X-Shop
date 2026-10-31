import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

/**
 * The shared notification channel (Annex A, P0.5 - FULL).
 *
 * One place that knows how a confirmation looks, so "Added to cart",
 * "Removed from cart" and "Review added" are not three different inventions
 * in three different components.
 */
export interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (value === null) {
    throw new Error('useToast must be used inside a ToastProvider')
  }
  return value
}
