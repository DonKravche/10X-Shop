import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  /** Stretch to the width of the parent, used on mobile and in forms. */
  fullWidth?: boolean
}

/*
 * Hover, focus and disabled are defined once here so every button in the
 * application shows the same three states (Annex A, A3-TW / TW4).
 * Minimum height 44px keeps tap targets usable on a phone (O3).
 */
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 ' +
  'text-sm font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ' +
  'disabled:cursor-not-allowed disabled:opacity-40'

const VARIANTS: Record<ButtonVariant, string> = {
  // The single primary action: near-black, never a brand colour.
  primary: 'bg-ink text-surface hover:opacity-90 disabled:hover:bg-ink',
  secondary:
    'border border-strong bg-surface text-ink hover:bg-ground ' +
    'disabled:hover:bg-surface',
}

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
