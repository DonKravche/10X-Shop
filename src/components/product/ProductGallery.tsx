import { useState } from 'react'

interface ProductGalleryProps {
  images: string[]
  thumbnail: string
  /** The product title, used as the alt text for the main image. */
  title: string
}

/**
 * The product image gallery (Annex A, P3).
 *
 * Which picture is shown is local component state: nothing outside this
 * component needs to know, so it does not belong in Context.
 *
 * `key={title}` on the component is what resets the selection when the route
 * moves to another product - see ProductPage.
 */
export default function ProductGallery({ images, thumbnail, title }: ProductGalleryProps) {
  // Some catalogue entries have no gallery, so fall back to the thumbnail.
  const gallery = images.length > 0 ? images : [thumbnail]
  const [activeImage, setActiveImage] = useState(gallery[0])

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-white p-6">
        <img
          src={activeImage}
          alt={title}
          width={800}
          height={800}
          className="h-full w-full object-contain"
        />
      </div>

      {gallery.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {gallery.map((image) => {
            const isActive = image === activeImage
            return (
              <li key={image}>
                <button
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-pressed={isActive}
                  className={[
                    'h-20 w-20 overflow-hidden rounded-md border bg-white p-1 transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950',
                    isActive
                      ? 'border-neutral-950'
                      : 'border-neutral-200 hover:border-neutral-400',
                  ].join(' ')}
                >
                  <img
                    src={image}
                    alt={`${title} thumbnail`}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
