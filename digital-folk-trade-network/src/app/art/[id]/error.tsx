"use client";

import { useEffect } from "react";

export default function ArtDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Art detail error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
        {/* Error icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
            Failed to Load Artwork
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300">
            We couldn't retrieve the artwork details. The item might not exist or there may be a connection issue.
          </p>
          {error.message && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              Error: {error.message}
            </p>
          )}
        </div>

        {/* Retry button */}
        <button
          onClick={reset}
          className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Try Again
        </button>

        {/* Alternative actions */}
        <div className="flex flex-col space-y-2">
          <a
            href="/marketplace"
            className="block text-sm text-red-700 underline hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
          >
            Browse All Artworks
          </a>
          <a
            href="/"
            className="block text-sm text-red-700 underline hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
          >
            Return to Home
          </a>
        </div>
      </div>
    </main>
  );
}
