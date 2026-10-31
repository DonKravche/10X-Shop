/**
 * The shape of a product card while its data is in flight (Annex A, P2.2).
 *
 * It occupies the same space the real card will, so the grid does not jump
 * when the response lands - the same reason the images carry width and
 * height. `aria-hidden` keeps it out of the accessibility tree: the status
 * message above the grid already announces that loading is happening, and a
 * screen reader has no use for twelve empty rectangles.
 */
export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex w-full animate-pulse flex-col rounded-lg border border-line bg-surface"
    >
      <div className="aspect-square rounded-t-lg bg-ground" />
      <div className="flex flex-1 flex-col gap-3 border-t border-line p-4">
        <div className="h-4 w-4/5 rounded bg-ground" />
        <div className="h-3 w-2/5 rounded bg-ground" />
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="h-5 w-1/2 rounded bg-ground" />
          <div className="h-11 w-full rounded-md bg-ground" />
        </div>
      </div>
    </div>
  )
}
