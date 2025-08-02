"use client";

import { useEffect } from 'react';

// Preload critical resources
export function PerformanceOptimizations() {
  useEffect(() => {
    // Preload critical API endpoints
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Prefetch common routes
        const router = document.createElement('link');
        router.rel = 'prefetch';
        router.href = '/snippets';
        document.head.appendChild(router);

        // Preconnect to external services
        const preconnects = [
          'https://api.openai.com',
          'https://fonts.googleapis.com',
        ];

        preconnects.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = url;
          document.head.appendChild(link);
        });
      });
    }

    // Service Worker registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return null;
}