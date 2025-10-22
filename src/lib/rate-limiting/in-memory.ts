// src/lib/rate-limiting/in-memory.ts
/**
 * In-Memory Rate Limiter (Development Only)
 *
 * Simple rate limiter for development and testing.
 * DO NOT use in production with load balancers!
 *
 * This is a wrapper around rate-limit-simple.ts to provide
 * the same interface as the Upstash implementation.
 */

import {
  rateLimit as simpleLimiter,
  RATE_LIMITS,
  createRateLimitResponse as simpleResponse,
  getClientIdentifier as simpleIdentifier,
} from '../rate-limit-simple';

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

// Map new types to old RATE_LIMITS config
const CONFIG_MAP: Record<RateLimiterType, keyof typeof RATE_LIMITS> = {
  login: 'AUTH_LOGIN',
  authCodeRequest: 'AUTH_CODE_REQUEST',
  authCodeVerify: 'AUTH_CODE_VERIFY',
  newsletterSubscribe: 'NEWSLETTER_SUBSCRIBE',
  contactForm: 'CONTACT_FORM',
  petitionSign: 'PETITION_SIGN',
  pollVote: 'POLL_VOTE',
  quizSubmit: 'QUIZ_SUBMIT',
  apiDefault: 'API_GENERAL',
  apiStrict: 'API_GENERAL', // Use same as default for now
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * In-memory rate limiter (development only)
 */
export async function rateLimit(
  identifier: string,
  type: RateLimiterType
): Promise<RateLimitResult> {
  const configKey = CONFIG_MAP[type];
  const config = RATE_LIMITS[configKey];

  if (!config) {
    console.warn(
      `[Rate Limiter] Unknown type ${type}, using default config`
    );
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    };
  }

  return simpleLimiter(identifier, config);
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(
  result: RateLimitResult
): Response {
  return simpleResponse(result);
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  return simpleIdentifier(request);
}
