export function measurePerformance<T>(
    name: string,
    fn: () => T | Promise<T>
  ): T | Promise<T> {
    if (process.env.NODE_ENV !== 'development') {
      return fn();
    }
  
    const start = performance.now();
    const result = fn();
  
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
  }
  
  // Preload images
  export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }
  
  // Lazy load code syntax highlighter
  export async function lazyLoadSyntaxHighlighter() {
    const { Prism } = await import('react-syntax-highlighter');
    const { vscDarkPlus } = await import('react-syntax-highlighter/dist/esm/styles/prism');
    return { Prism, vscDarkPlus };
  }
  
  // Web Vitals tracking
  export function trackWebVitals() {
    if (typeof window === 'undefined') return;
  
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }