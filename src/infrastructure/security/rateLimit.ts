/**
 * In-memory rate limiter for Server Actions and Route Handlers.
 *
 * LIMITATION: each serverless/edge instance has its own Map, so limits are
 * per instance, not global. It stops casual abuse only. For a hard limit,
 * swap the Map for a shared store (e.g. Upstash Redis @upstash/ratelimit)
 * behind this same `check()` signature.
 */

interface RateLimitData {
  count: number;
  reset: number;
}

const cache = new Map<string, RateLimitData>();

export const rateLimit = {
  /**
   * Checks if the given token (usually an IP or User ID) has exceeded the limit.
   * @param limit Max requests allowed in the window
   * @param windowInMs Window size in milliseconds
   * @param token Unique identifier for the client
   */
  async check(limit: number, windowInMs: number, token: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    // Bound memory: drop expired entries once the map gets large.
    if (cache.size > 5000) this.prune();
    const data = cache.get(token);

    if (!data || now > data.reset) {
      // New window or first request
      const newData = { count: 1, reset: now + windowInMs };
      cache.set(token, newData);
      return { success: true, remaining: limit - 1, reset: newData.reset };
    }

    if (data.count >= limit) {
      // Limit exceeded
      return { success: false, remaining: 0, reset: data.reset };
    }

    // Increment count
    data.count += 1;
    cache.set(token, data);
    return { success: true, remaining: limit - data.count, reset: data.reset };
  },

  /**
   * Cleanup task to prevent memory leaks (can be called via a cron job if needed, 
   * but in-memory Maps are usually fine for simple portfolio setups).
   */
  prune(): void {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now > value.reset) {
        cache.delete(key);
      }
    }
  }
};
