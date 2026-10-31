import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './toast-context'
import type { Toast, ToastTone } from './toast-context'

/** Long enough to read a short sentence, short enough not to linger. */
const VISIBLE_MS = 3000

interface ToastProviderProps {
  children: ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  // A counter rather than Date.now(): two toasts raised in the same
  // millisecond would otherwise share a key.
  const nextId = useRef(0)
  const timers = useRef<number[]>([])

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current
    nextId.current += 1

    setToasts((current) => [...current, { id, message, tone }])

    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, VISIBLE_MS)
    timers.current.push(timer)
  }, [])

  // Every pending timer is cancelled on unmount. Without this a toast raised
  // just before a navigation would try to update a component that is gone.
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(window.clearTimeout)
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext value={value}>
      {children}

      {/*
        aria-live="polite" so a screen reader is told what happened without
        being interrupted; pointer-events-none so the stack never blocks a
        click on whatever is underneath it.
      */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className={[
              'pointer-events-auto rounded-md px-4 py-2 text-sm font-medium shadow-lg',
              toast.tone === 'error'
                ? 'bg-red-700 text-surface'
                : 'bg-ink text-surface',
            ].join(' ')}
          >
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext>
  )
}
