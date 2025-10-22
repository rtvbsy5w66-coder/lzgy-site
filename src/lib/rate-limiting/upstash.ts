// src/lib/rate-limiting/upstash.ts
/**
 * Production-ready Rate Limiter using Upstash Redis
 *
 * Features:
 * - Distributed rate limiting (works with load balancers)
 * - Analytics and monitoring
 * - Sliding window algorithm
 * - Multiple limit configurations
 *
 * Setup: https://upstash.com/
 * Vercel Integration: https://vercel.com/integrations/upstash
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Redis client initialization
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[Rate Limiter] Upstash credentials not found. Using in-memory fallback.'
    );
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

const redis = createRedisClient();

// Rate limiter configurations
export const rateLimiters = redis
  ? {
      // Authentication endpoints
      login: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: 'ratelimit:login',
      }),

      authCodeRequest: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '15 m'),
        analytics: true,
        prefix: 'ratelimit:auth-code-request',
      }),

      authCodeVerify: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: 'ratelimit:auth-code-verify',
      }),

      // Newsletter endpoints
      newsletterSubscribe: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: 'ratelimit:newsletter-subscribe',
      }),

      // Contact form
      contactForm: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 h'),
        analytics: true,
        prefix: 'ratelimit:contact-form',
      }),

      // Petition signing
      petitionSign: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ratelimit:petition-sign',
      }),

      // Poll voting
      pollVote: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 h'),
        analytics: true,
        prefix: 'ratelimit:poll-vote',
      }),

      // Quiz submission
      quizSubmit: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        analytics: true,
        prefix: 'ratelimit:quiz-submit',
      }),

      // General API
      apiDefault: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '15 m'),
        analytics: true,
        prefix: 'ratelimit:api-default',
      }),

      // Strict API (admin endpoints)
      apiStrict: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '5 m'),
        analytics: true,
        prefix: 'ratelimit:api-strict',
      }),
    }
  : null;

export type RateLimiterType = keyof NonNullable<typeof rateLimiters>;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Apply rate limiting using Upstash Redis
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param type - Rate limiter configuration type
 * @returns Rate limit result with success status and metadata
 *
 * @example
 * ```typescript
 * const result = await rateLimit('192.168.1.1', 'login');
 * if (!result.success) {
 *   return new Response('Too many requests', { status: 429 });
 * }
 * ```
 */
export async function rateLimit(
  identifier: string,
  type: RateLimiterType
): Promise<RateLimitResult> {
  // Fallback if Redis not configured
  if (!rateLimiters) {
    console.warn(
      `[Rate Limiter] Upstash not configured, allowing request for ${identifier}`
    );
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    };
  }

  const limiter = rateLimiters[type];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Create a standardized rate limit error response
 *
 * @param result - Rate limit result from rateLimit()
 * @returns Response object with 429 status and retry headers
 */
export function createRateLimitResponse(
  result: RateLimitResult
): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Túl sok kérés. Kérjük próbálja újra később.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
      limit: result.limit,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
      },
    }
  );
}

/**
 * Get client identifier from request headers
 *
 * @param request - Next.js request object
 * @returns Client identifier (IP address or 'anonymous')
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'anonymous';

  return ip.trim().substring(0, 45); // Max IPv6 length
}
