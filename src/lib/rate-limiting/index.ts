// src/lib/rate-limiting/index.ts
/**
 * Unified Rate Limiting Interface
 *
 * Automatically selects the appropriate rate limiter:
 * - Production: Upstash Redis (distributed, scalable)
 * - Development: In-memory (simple, no external deps)
 */

import type { RateLimitResult } from './upstash';

// Type definition for rate limiter types
export type RateLimiterType =
  | 'login'
  | 'authCodeRequest'
  | 'authCodeVerify'
  | 'newsletterSubscribe'
  | 'contactForm'
  | 'petitionSign'
  | 'pollVote'
  | 'quizSubmit'
  | 'apiDefault'
  | 'apiStrict';

// Mapping to old RATE_LIMITS config for backward compatibility
export const RATE_LIMIT_CONFIGS = {
  LOGIN: 'login' as const,
  AUTH_CODE_REQUEST: 'authCodeRequest' as const,
  AUTH_CODE_VERIFY: 'authCodeVerify' as const,
  NEWSLETTER_SUBSCRIBE: 'newsletterSubscribe' as const,
  CONTACT_FORM: 'contactForm' as const,
  PETITION_SIGN: 'petitionSign' as const,
  POLL_VOTE: 'pollVote' as const,
  QUIZ_SUBMIT: 'quizSubmit' as const,
  API_DEFAULT: 'apiDefault' as const,
  API_STRICT: 'apiStrict' as const,
};

/**
 * Main rate limiting function
 * Automatically uses Upstash in production, in-memory in development
 */
export async function rateLimit(
  identifier: string,
  type: RateLimiterType
): Promise<RateLimitResult> {
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.UPSTASH_REDIS_REST_URL;

  if (isProduction) {
    // Use Upstash Redis in production
    const { rateLimit: upstashRateLimit } = await import('./upstash');
    return upstashRateLimit(identifier, type);
  } else {
    // Use in-memory rate limiter in development
    const { rateLimit: inMemoryRateLimit } = await import('./in-memory');
    return inMemoryRateLimit(identifier, type);
  }
}

/**
 * Create rate limit error response
 */
export async function createRateLimitResponse(
  result: RateLimitResult
): Promise<Response> {
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.UPSTASH_REDIS_REST_URL;

  if (isProduction) {
    const { createRateLimitResponse: upstashResponse } = await import(
      './upstash'
    );
    return upstashResponse(result);
  } else {
    const { createRateLimitResponse: inMemoryResponse } = await import(
      './in-memory'
    );
    return inMemoryResponse(result);
  }
}

/**
 * Get client identifier from request
 */
export async function getClientIdentifier(
  request: Request
): Promise<string> {
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.UPSTASH_REDIS_REST_URL;

  if (isProduction) {
    const { getClientIdentifier: upstashId } = await import('./upstash');
    return upstashId(request);
  } else {
    const { getClientIdentifier: inMemoryId } = await import('./in-memory');
    return inMemoryId(request);
  }
}

// Re-export types
export type { RateLimitResult };
