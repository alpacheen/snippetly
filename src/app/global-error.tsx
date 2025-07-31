"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-primary text-text min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>

          <h1 className="text-2xl font-bold text-text mb-4">
            Something went wrong!
          </h1>

          <p className="text-textSecondary mb-6">
            We&apos;re sorry, but something unexpected happened. Our team has
            been notified.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
            >
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full px-6 py-3 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
