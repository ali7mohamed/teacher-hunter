import "server-only";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

/**
 * In-memory sliding-window limiter. §37: architecture allows swapping in
 * Upstash Redis later — just implement RateLimiter and swap the export
 * below. Not safe across multiple server instances; fine for a single
 * Next.js server / low-traffic MVP.
 */
class InMemoryRateLimiter implements RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(private limit: number, private windowMs: number) {}

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const existing = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    if (existing.length >= this.limit) {
      return { success: false, remaining: 0, resetMs: existing[0] + this.windowMs - now };
    }

    existing.push(now);
    this.hits.set(key, existing);
    return { success: true, remaining: this.limit - existing.length, resetMs: this.windowMs };
  }
}

/** §37: search is the expensive endpoint — 10 searches / 5 minutes per user. */
export const searchRateLimiter: RateLimiter = new InMemoryRateLimiter(10, 5 * 60 * 1000);

/** Thumbnail analysis calls an AI model — cap harder. */
export const analyzeRateLimiter: RateLimiter = new InMemoryRateLimiter(20, 60 * 60 * 1000);
