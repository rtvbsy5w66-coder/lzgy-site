// src/lib/rate-limiter.ts
import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

// Default rate limit configurations
export const RATE_LIMITS = {
  API_DEFAULT: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  API_STRICT: { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 requests per 5 minutes
  PETITION_SIGN: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 petition signs per minute
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 login attempts per 15 minutes
};

export function getRateLimitKey(req: NextRequest, identifier?: string): string {
  const ip = req.headers.get('x-forwarded-for') || 
            req.headers.get('x-real-ip') || 
            'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  const baseKey = identifier || `${ip}:${userAgent.slice(0, 50)}`;
  
  return `ratelimit:${baseKey}`;
}

export function checkRateLimit(
  key: string, 
  config: RateLimitConfig
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Clean up old entries
  if (rateLimitStore[key] && rateLimitStore[key].resetTime < windowStart) {
    delete rateLimitStore[key];
  }
  
  // Initialize or get current count
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }
  
  const current = rateLimitStore[key];
  
  // Check if limit exceeded
  if (current.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  // Increment counter
  current.count++;
  
  return {
    success: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime
  };
}

export function createRateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: "Túl sok kérés. Kérjük próbálja újra később.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.floor(resetTime / 1000).toString()
      }
    }
  );
}

// Middleware function for rate limiting
export function rateLimit(config: RateLimitConfig = RATE_LIMITS.API_DEFAULT) {
  return (req: NextRequest) => {
    const key = getRateLimitKey(req);
    const result = checkRateLimit(key, config);
    
    if (!result.success) {
      return createRateLimitResponse(result.resetTime);
    }
    
    return null; // No rate limit exceeded
  };
}