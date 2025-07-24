class SimpleCache<T> {
    private cache = new Map<string, { data: T; timestamp: number }>();
    private ttl: number;
  
    constructor(ttlMinutes = 5) {
      this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    }
  
    set(key: string, data: T): void {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });
    }
  
    get(key: string): T | null {
      const item = this.cache.get(key);
      
      if (!item) return null;
      
      if (Date.now() - item.timestamp > this.ttl) {
        this.cache.delete(key);
        return null;
      }
      
      return item.data;
    }
  
    clear(): void {
      this.cache.clear();
    }
  
    has(key: string): boolean {
      const item = this.cache.get(key);
      if (!item) return false;
      
      if (Date.now() - item.timestamp > this.ttl) {
        this.cache.delete(key);
        return false;
      }
      
      return true;
    }
  }
  
  // Global cache instances
  export const snippetsCache = new SimpleCache<any[]>(10); // 10 minutes
  export const tagsCache = new SimpleCache<string[]>(30); // 30 minutes
  export const userCache = new SimpleCache<any>(5); // 5 minutes
  