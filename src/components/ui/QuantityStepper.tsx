interface QuantityStepperProps {
  value: number
  /** Upper bound, normally the product's remaining stock. */
  max: number
  onChange: (next: number) => void
  /** Names the control for assistive technology, e.g. the product title. */
  label: string
  min?: number
}

/**
 * The minus / plus quantity control (Annex A, P3 and P4).
 *
 * Clamping lives here rather than in each caller, so no screen can push a
 * quantity below 1 or above the remaining stock. The buttons disable at the
 * limits instead of silently refusing the click (TW4).
 */
export default function QuantityStepper({
  value,
  max,
  onChange,
  label,
  min = 1,
}: QuantityStepperProps) {
  const clamp = (next: number): number => Math.min(Math.max(next, min), max)

  const buttonClass =
    'inline-flex h-11 w-11 shrink-0 items-center justify-center text-lg text-ink ' +
    'transition-colors hover:bg-ground ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ' +
    'disabled:cursor-not-allowed disabled:text-subtle disabled:hover:bg-transparent'

  return (
    <div className="inline-flex items-center rounded-md border border-strong bg-surface">
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        &minus;
      </button>

      <output
        aria-label={`Quantity of ${label}`}
        className="w-10 text-center text-sm font-medium tabular-nums text-ink"
      >
        {value}
      </output>

      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        +
      </button>
    </div>
  )
}
