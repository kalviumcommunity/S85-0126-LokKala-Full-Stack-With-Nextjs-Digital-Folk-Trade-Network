export default function DashboardLoading() {
  return (
    <main className="space-y-6 p-6">
      <header className="space-y-3">
        {/* Title skeleton */}
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        {/* Subtitle skeleton */}
        <div className="h-6 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-600"></div>
        <div className="h-6 w-5/6 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-600"></div>
      </header>

      <section className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        
        {/* Stats cards grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Card title */}
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
              {/* Card value */}
              <div className="h-12 w-1/2 animate-pulse rounded bg-gray-400 dark:bg-gray-500"></div>
              {/* Card description */}
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
