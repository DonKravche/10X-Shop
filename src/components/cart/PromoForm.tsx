import { useState } from 'react'
import type { FormEvent } from 'react'
import Button from '../ui/Button'

interface PromoFormProps {
  onApply: (code: string) => boolean
}

/**
 * The promo code field (Annex A, P4.4).
 *
 * Whether a code is valid is the cart's business, not this component's: it
 * submits what was typed and shows the exact message the specification fixes
 * when the answer is no.
 */
export default function PromoForm({ onApply }: PromoFormProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (onApply(code)) {
      setCode('')
      setError(null)
      return
    }

    setError('Invalid promo code')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 border-t border-line pt-5">
      <label htmlFor="promo" className="block text-sm font-medium text-ink">
        Promo code
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="promo"
          name="promo"
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            setError(null)
          }}
          aria-invalid={error !== null}
          aria-describedby={error !== null ? 'promo-error' : undefined}
          className={[
            'min-h-11 w-full rounded-md border bg-surface px-3 text-sm uppercase text-ink',
            'placeholder:normal-case placeholder:text-subtle',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
            error !== null ? 'border-red-600' : 'border-strong',
          ].join(' ')}
          placeholder="Enter a code"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          Apply
        </Button>
      </div>
      {error !== null ? (
        <p id="promo-error" className="mt-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </form>
  )
}
