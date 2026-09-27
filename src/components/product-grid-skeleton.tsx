/** Placeholder grid in the product card's shape while results load. */
export function ProductGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading results">
      <div className="mb-8 h-4.5 w-16 bg-surface md:mb-10" />
      <div className="grid-products motion-safe:animate-pulse">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-product bg-surface" />
            <div className="mt-3 space-y-2 px-1">
              <div className="h-3 w-1/4 bg-surface" />
              <div className="h-3.5 w-2/3 bg-surface" />
              <div className="h-3.5 w-1/3 bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder rows in the list view's shape while results load. */
export function ProductListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading results">
      <div className="mb-6 h-4.5 w-16 bg-surface" />
      <div className="border-t border-line motion-safe:animate-pulse">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 border-b border-line py-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-x-8"
          >
            <div className="aspect-product bg-surface" />
            <div className="space-y-3">
              <div className="h-3 w-1/5 bg-surface" />
              <div className="h-4 w-1/2 bg-surface" />
              <div className="h-3.5 w-1/4 bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
