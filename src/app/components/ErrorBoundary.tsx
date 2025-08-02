// "use client";

// import React from "react";
// import { AlertTriangle, RefreshCw, Home } from "lucide-react";

// interface ErrorBoundaryState {
//   hasError: boolean;
//   error?: Error;
//   errorInfo?: React.ErrorInfo;
// }

// interface ErrorBoundaryProps {
//   children: React.ReactNode;
//   fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
// }

// class ErrorBoundary extends React.Component<
//   ErrorBoundaryProps,
//   ErrorBoundaryState
// > {
//   constructor(props: ErrorBoundaryProps) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error: Error): ErrorBoundaryState {
//     return {
//       hasError: true,
//       error,
//     };
//   }

//   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
//     this.setState({
//       error,
//       errorInfo,
//     });

//     // Log error to console in development
//     if (process.env.NODE_ENV === "development") {
//       console.error("Error Boundary caught an error:", error, errorInfo);
//     }
//   }

//   retry = () => {
//     this.setState({ hasError: false, error: undefined, errorInfo: undefined });
//   };

//   render() {
//     if (this.state.hasError) {
//       if (this.props.fallback) {
//         const Fallback = this.props.fallback;
//         return <Fallback error={this.state.error} retry={this.retry} />;
//       }

//       return (
//         <DefaultErrorFallback error={this.state.error} retry={this.retry} />
//       );
//     }

//     return this.props.children;
//   }
// }

// interface DefaultErrorFallbackProps {
//   error?: Error;
//   retry: () => void;
// }

// function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
//   return (
//     <div className="min-h-screen bg-primary flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-brand-secondary rounded-lg p-6 text-center">
//         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <AlertTriangle className="w-8 h-8 text-red-600" />
//         </div>

//         <h1 className="text-xl font-bold text-text mb-2">
//           Oops! Something went wrong
//         </h1>

//         <p className="text-textSecondary mb-6">
//           We encountered an unexpected error. Don&apos;t worry, our team has
//           been notified.
//         </p>

//         {process.env.NODE_ENV === "development" && error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left">
//             <p className="text-sm font-medium text-red-800 mb-2">
//               Error Details:
//             </p>
//             <p className="text-xs text-red-600 font-mono break-all">
//               {error.message}
//             </p>
//           </div>
//         )}

//         <div className="space-y-3">
//           <button
//             onClick={retry}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Try Again
//           </button>

//           <button
//             onClick={() => (window.location.href = "/")}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
//           >
//             <Home className="w-4 h-4" />
//             Go Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ErrorBoundary;
"use client";

import React, { ErrorInfo } from 'react';

interface PerformanceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  performanceEntry?: PerformanceEntry;
}

export class PerformanceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  PerformanceErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PerformanceErrorBoundaryState {
    // Capture performance data when error occurs
    const performanceEntry = performance.getEntriesByType('navigation')[0];
    
    return {
      hasError: true,
      error,
      performanceEntry,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log performance data with error
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service
      this.logErrorWithPerformance(error, errorInfo);
    }
  }

  private logErrorWithPerformance(error: Error, errorInfo: ErrorInfo) {
    const performanceData = {
      // Core Web Vitals
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      // Navigation timing
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      // Error context
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // In production, send to your error tracking service
    console.error('Performance Error Report:', performanceData);
  }

  private getLCP(): number | null {
    try {
      const entries = performance.getEntriesByType('largest-contentful-paint');
      return entries.length > 0 ? entries[entries.length - 1].startTime : null;
    } catch {
      return null;
    }
  }

  private getFID(): number | null {
    try {
      const entries = performance.getEntriesByType('first-input');
      return entries.length > 0 ? entries[0].processingStart - entries[0].startTime : null;
    } catch {
      return null;
    }
  }

  private getCLS(): number | null {
    try {
      const entries = performance.getEntriesByType('layout-shift');
      return entries.reduce((sum, entry: any) => sum + entry.value, 0);
    } catch {
      return null;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-brand-secondary rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-text mb-2">
              Something went wrong
            </h1>
            <p className="text-textSecondary mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-red-600">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Web Vitals monitoring
export function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'web-vitals' in window === false) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(sendToAnalytics);
        getFID(sendToAnalytics);
        getFCP(sendToAnalytics);
        getLCP(sendToAnalytics);
        getTTFB(sendToAnalytics);
      });
    }
  }, []);

  return null;
}

function sendToAnalytics(metric: any) {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
  
  // Example: Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      custom_map: { metric_id: 'dimension1' },
      metric_id: metric.id,
      metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_delta: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
    });
  }
}