export default function MarketplaceLoading() {
  return (
    <main className="space-y-6 p-6">
      {/* Page title skeleton */}
      <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>

      {/* Artworks list skeleton */}
      <ul className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <li
            key={i}
            className="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Artwork thumbnail placeholder */}
            <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
            {/* Artwork title */}
            <div className="flex-1 space-y-2">
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </li>
        ))}
      </ul>

      {/* Info text skeleton */}
      <div className="h-5 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
    </main>
  );
}
