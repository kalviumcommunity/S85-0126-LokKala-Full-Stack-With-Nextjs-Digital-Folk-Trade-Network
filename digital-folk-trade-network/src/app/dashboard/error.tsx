"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
            Oops! Something went wrong
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300">
            We encountered an error while loading the dashboard. This might be a temporary issue.
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

        {/* Alternative action */}
        <Link
          href="/"
          className="block text-sm text-red-700 underline hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
