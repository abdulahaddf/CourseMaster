/**
 * Simple in-memory cache for database query results
 * This is a basic implementation suitable for single-instance deployments
 * For production with multiple instances, consider Redis or similar
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number = 60 * 1000; // 1 minute default

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set pattern - fetch from cache or execute fn and cache result
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fn();
    this.set(key, data, ttlMs);
    return data;
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const cache = new SimpleCache();

// Cache key generators
export const cacheKeys = {
  courseList: (params: Record<string, string>) => 
    `courses:list:${JSON.stringify(params)}`,
  courseDetail: (slug: string) => 
    `courses:detail:${slug}`,
  courseCategories: () => 
    "courses:categories",
  userEnrollments: (userId: string) => 
    `enrollments:user:${userId}`,
  courseEnrollments: (courseId: string) => 
    `enrollments:course:${courseId}`,
  stats: (type: string) => 
    `stats:${type}`,
};

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  SHORT: 30 * 1000,      // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000,  // 30 minutes
  HOUR: 60 * 60 * 1000,  // 1 hour
};
