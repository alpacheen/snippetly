interface QueryOptions {
    enableCache?: boolean;
    cacheTTL?: number;
    timeout?: number;
  }
  
  class DatabaseOptimizer {
    private static instance: DatabaseOptimizer;
    private queryCache = new Map<string, { data: any; expiry: number }>();
  
    public static getInstance(): DatabaseOptimizer {
      if (!DatabaseOptimizer.instance) {
        DatabaseOptimizer.instance = new DatabaseOptimizer();
      }
      return DatabaseOptimizer.instance;
    }
  
    public async optimizedQuery(
      queryFn: () => Promise<any>,
      cacheKey: string,
      options: QueryOptions = {}
    ) {
      const { enableCache = true, cacheTTL = 300000, timeout = 10000 } = options;
  
      // Check cache first
      if (enableCache && this.queryCache.has(cacheKey)) {
        const cached = this.queryCache.get(cacheKey)!;
        if (Date.now() < cached.expiry) {
          return { data: cached.data, fromCache: true };
        }
        this.queryCache.delete(cacheKey);
      }
  
      // Execute query with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), timeout)
      );
  
      try {
        const result = await Promise.race([queryFn(), timeoutPromise]);
        
        // Cache result
        if (enableCache) {
          this.queryCache.set(cacheKey, {
            data: result,
            expiry: Date.now() + cacheTTL
          });
        }
  
        return { data: result, fromCache: false };
      } catch (error) {
        console.error('Database query error:', error);
        throw error;
      }
    }
  
    public clearCache(pattern?: string) {
      if (pattern) {
        for (const key of this.queryCache.keys()) {
          if (key.includes(pattern)) {
            this.queryCache.delete(key);
          }
        }
      } else {
        this.queryCache.clear();
      }
    }
  }
  
  export const dbOptimizer = DatabaseOptimizer.getInstance();