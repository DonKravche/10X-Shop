import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Used for both the input id and the label's htmlFor (Annex A, O3). */
  id: string
  label: string
  /** The validation message for this field, shown directly beneath it. */
  error?: string
}

/**
 * One labelled, controlled input with its error message.
 *
 * The label is tied to the input by htmlFor/id and the error is announced
 * through aria-describedby, so the message reaches a screen reader and not
 * only a sighted user (Annex A, O3).
 */
export default function FormField({ id, label, error, className = '', ...rest }: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-950">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? errorId : undefined}
        className={[
          'mt-2 block min-h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-950',
          'placeholder:text-neutral-400',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950',
          error !== undefined ? 'border-red-600' : 'border-neutral-300',
        ].join(' ')}
        {...rest}
      />
      {error !== undefined ? (
        <p id={errorId} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
