/**
 * Simple In-Memory Rate Limiter
 *
 * This is a development-friendly rate limiter that stores request counts in memory.
 * For production, use Redis-based solution (Upstash).
 *
 * Features:
 * - Sliding window algorithm
 * - IP-based tracking
 * - Automatic cleanup of expired entries
 * - TypeScript support
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
  }

  async limit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No previous requests or window expired
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs;
      this.store.set(identifier, { count: 1, resetAt });

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: resetAt,
      };
    }

    // Within rate limit window
    if (entry.count < maxRequests) {
      entry.count++;
      this.store.set(identifier, entry);

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - entry.count,
        reset: entry.resetAt,
      };
    }

    // Rate limit exceeded
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new InMemoryRateLimiter();

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  AUTH_LOGIN: {
    max: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },
  AUTH_CODE_REQUEST: {
    max: 3,
    window: 15 * 60 * 1000, // 15 minutes
  },
  AUTH_CODE_VERIFY: {
    max: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },

  // Newsletter endpoints
  NEWSLETTER_SUBSCRIBE: {
    max: 3,
    window: 60 * 60 * 1000, // 1 hour
  },

  // Contact form
  CONTACT_FORM: {
    max: 5,
    window: 60 * 60 * 1000, // 1 hour
  },

  // Petition signing
  PETITION_SIGN: {
    max: 10,
    window: 60 * 60 * 1000, // 1 hour
  },

  // Poll voting
  POLL_VOTE: {
    max: 20,
    window: 60 * 60 * 1000, // 1 hour
  },

  // Quiz submission
  QUIZ_SUBMIT: {
    max: 10,
    window: 60 * 60 * 1000, // 1 hour
  },

  // General API
  API_GENERAL: {
    max: 100,
    window: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Apply rate limiting to a request
 *
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimit(
  identifier: string,
  config: { max: number; window: number }
): Promise<RateLimitResult> {
  return rateLimiter.limit(identifier, config.max, config.window);
}

/**
 * Get client identifier from request
 * Uses IP address from headers or defaults to 'anonymous'
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'anonymous';

  // Sanitize IP address
  return ip.trim().substring(0, 45); // Max IPv6 length
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Túl sok kérés. Kérlek, próbáld újra később.',
      retryAfter,
      limit: result.limit,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

/**
 * Clean up rate limiter on process exit
 */
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    rateLimiter.destroy();
  });
}

export default rateLimiter;
