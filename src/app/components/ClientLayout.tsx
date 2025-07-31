"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import NavBar from "@/app/components/NavBar";
import { AuthProvider } from "@/lib/auth-context";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

// Custom error fallback for the main app
function AppErrorFallback({
  error,
  retry,
}: {
  error?: Error;
  retry: () => void;
}) {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <header className="px-6 py-4 border-b border-textSecondary">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-text">Snippetly</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-brand-secondary rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-text mb-2">
            Something went wrong
          </h1>

          <p className="text-textSecondary mb-6">
            We&apos;re sorry, but something unexpected happened. Please try
            refreshing the page.
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left">
              <p className="text-sm font-medium text-red-800 mb-2">
                Error Details:
              </p>
              <p className="text-xs text-red-600 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={retry}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </button>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-textSecondary text-center text-textSecondary">
        &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
      </footer>
    </div>
  );
}

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-primary)",
            color: "var(--color-text)",
            border: "1px solid var(--color-textSecondary)",
          },
        }}
      />
      <AuthProvider>
        <ErrorBoundary>
          <NavBar />
        </ErrorBoundary>
        <main className="flex-grow container mx-auto px-4 py-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <footer className="px-6 py-4 border-t border-textSecondary text-center text-textSecondary">
          &copy; {new Date().getFullYear()} Snippetly. All rights reserved.
        </footer>
      </AuthProvider>
    </ErrorBoundary>
  );
}
