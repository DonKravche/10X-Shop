import { useState } from 'react'
import type { FormEvent } from 'react'
import Button from '../ui/Button'
import type { Review } from '../../types/product'
import type { ReviewFormErrors, ReviewFormValues } from '../../utils/validation'
import { hasErrors, validateReview } from '../../utils/validation'

interface ReviewFormProps {
  /** Who the review will be signed by: the signed-in name, or "Guest". */
  reviewerName: string
  onSubmit: (review: Review) => void
}

const EMPTY_FORM: ReviewFormValues = { rating: 0, comment: '' }

/**
 * Writing a review (Annex A, P3.4).
 *
 * A controlled form. The rating is five radio inputs rather than five
 * buttons, because a rating is one choice from a set - which is what a radio
 * group means, and what gets it arrow-key navigation and a screen-reader
 * announcement for free.
 */
export default function ReviewForm({ reviewerName, onSubmit }: ReviewFormProps) {
  const [values, setValues] = useState<ReviewFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<ReviewFormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateReview(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    onSubmit({
      rating: values.rating,
      comment: values.comment.trim(),
      date: new Date().toISOString(),
      reviewerName,
    })

    setValues(EMPTY_FORM)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="border-t border-line pt-6">
      <h3 className="text-base font-medium text-ink">Write a review</h3>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-ink">Rating</legend>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className="cursor-pointer rounded-sm p-1 text-2xl leading-none transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
            >
              <input
                type="radio"
                name="rating"
                value={star}
                checked={values.rating === star}
                onChange={() => {
                  setValues((current) => ({ ...current, rating: star }))
                  setErrors((current) => ({ ...current, rating: undefined }))
                }}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={star <= values.rating ? 'text-ink' : 'text-strong'}
              >
                &#9733;
              </span>
              <span className="sr-only">{star} of 5</span>
            </label>
          ))}
        </div>
        {errors.rating !== undefined ? (
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">{errors.rating}</p>
        ) : null}
      </fieldset>

      <div className="mt-5">
        <label htmlFor="review-comment" className="block text-sm font-medium text-ink">
          Comment
        </label>
        <textarea
          id="review-comment"
          rows={4}
          value={values.comment}
          onChange={(event) => {
            const { value } = event.target
            setValues((current) => ({ ...current, comment: value }))
            setErrors((current) => ({ ...current, comment: undefined }))
          }}
          aria-invalid={errors.comment !== undefined}
          aria-describedby={errors.comment !== undefined ? 'review-comment-error' : undefined}
          className={[
            'mt-2 block w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink',
            'placeholder:text-subtle',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
            errors.comment !== undefined ? 'border-red-600' : 'border-strong',
          ].join(' ')}
          placeholder="What did you think of it?"
        />
        {errors.comment !== undefined ? (
          <p id="review-comment-error" className="mt-2 text-sm text-red-700 dark:text-red-400">
            {errors.comment}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="mt-5">
        Submit review
      </Button>
    </form>
  )
}
