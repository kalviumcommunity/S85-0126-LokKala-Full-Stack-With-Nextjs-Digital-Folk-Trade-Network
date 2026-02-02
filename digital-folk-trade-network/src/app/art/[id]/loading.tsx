export default function ArtDetailLoading() {
  return (
    <main className="space-y-6 p-6">
      {/* Page title skeleton */}
      <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>

      {/* Art detail card skeleton */}
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {/* Image placeholder */}
        <div className="h-64 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>

        {/* Title skeleton */}
        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Metadata skeleton */}
        <div className="flex gap-4">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
    </main>
  );
}
