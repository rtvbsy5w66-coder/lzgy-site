// src/lib/security-middleware.ts
import { NextRequest } from "next/server";
import { requireAdminAuth } from "./auth-middleware";
import { rateLimit, RATE_LIMITS } from "./rate-limiter";
import { requireCSRFToken } from "./csrf-protection";
import { SecurityValidator } from "./security-utils";

export interface SecurityConfig {
  requireAuth?: boolean;
  requireCSRF?: boolean;
  rateLimit?: keyof typeof RATE_LIMITS;
  validateInput?: boolean;
}

export async function applySecurityMiddleware(
  req: NextRequest, 
  config: SecurityConfig = {}
): Promise<Response | null> {
  
  // 1. Rate Limiting
  if (config.rateLimit) {
    const rateLimitConfig = RATE_LIMITS[config.rateLimit];
    const rateLimitCheck = rateLimit(rateLimitConfig);
    const rateLimitResult = rateLimitCheck(req);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }

  // 2. Authentication
  if (config.requireAuth) {
    const authResult = await requireAdminAuth(req);
    if (authResult) {
      return authResult;
    }
  }

  // 3. CSRF Protection
  if (config.requireCSRF) {
    const csrfResult = requireCSRFToken(req);
    if (!csrfResult.valid && csrfResult.error) {
      return csrfResult.error;
    }
  }

  // 4. Input Validation (deferred to individual handlers)
  // Note: Input validation is handled by individual route handlers
  // to avoid consuming the request body stream

  return null; // All security checks passed
}

// Predefined security configurations
export const SECURITY_CONFIGS = {
  PUBLIC_API: {
    rateLimit: 'API_DEFAULT' as const
  },
  
  ADMIN_API: {
    requireAuth: true,
    requireCSRF: true,
    rateLimit: 'API_STRICT' as const
  },
  
  PETITION_SIGN: {
    rateLimit: 'PETITION_SIGN' as const,
    requireCSRF: true // ✅ CSRF protection ENABLED
  },

  LOGIN: {
    rateLimit: 'LOGIN' as const,
    requireCSRF: true // ✅ CSRF protection ENABLED
  }
} satisfies Record<string, SecurityConfig>;