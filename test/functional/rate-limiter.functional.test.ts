// test/functional/rate-limiter.functional.test.ts
/**
 * OWASP A04: Insecure Design - Rate Limiter Tests
 *
 * Complete coverage of rate-limiter.ts (0% → 100%)
 * Tests all rate limiting logic, key generation, and response creation
 */

import {
  rateLimit,
  getRateLimitKey,
  checkRateLimit,
  createRateLimitResponse,
  RATE_LIMITS,
  RateLimitConfig,
} from '@/lib/rate-limiter';
import { createMockNextRequest } from '../utils/next-test-helpers';

describe('Rate Limiter - Complete Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRateLimitKey()', () => {
    it('EXECUTES: Generates key from x-forwarded-for header', () => {
      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
      });

      const key = getRateLimitKey(req);
      expect(key).toContain('ratelimit:');
      expect(key).toContain('192.168.1.1');
    });

    it('EXECUTES: Uses x-real-ip as fallback', () => {
      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-real-ip': '10.0.0.1',
          'user-agent': 'Chrome',
        },
      });

      const key = getRateLimitKey(req);
      expect(key).toContain('10.0.0.1');
    });

    it('EXECUTES: Uses unknown when no IP headers', () => {
      const req = createMockNextRequest({
        url: 'https://example.com',
      });

      const key = getRateLimitKey(req);
      expect(key).toContain('unknown');
    });

    it('EXECUTES: Includes user-agent in key', () => {
      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'CustomAgent/1.0',
        },
      });

      const key = getRateLimitKey(req);
      expect(key).toContain('CustomAgent');
    });

    it('EXECUTES: Truncates user-agent to 50 chars', () => {
      const longUA = 'A'.repeat(100);
      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': longUA,
        },
      });

      const key = getRateLimitKey(req);
      const uaPart = key.split(':').slice(2).join(':');
      expect(uaPart.length).toBeLessThanOrEqual(50);
    });

    it('EXECUTES: Uses custom identifier when provided', () => {
      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const key = getRateLimitKey(req, 'custom-user-123');
      expect(key).toBe('ratelimit:custom-user-123');
    });

    it('EXECUTES: Handles missing user-agent', () => {
      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const key = getRateLimitKey(req);
      expect(key).toContain('192.168.1.1');
    });
  });

  describe('checkRateLimit()', () => {
    const config: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      maxRequests: 3,
    };

    it('EXECUTES: Allows first request', () => {
      const result = checkRateLimit('test-key-1', config);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2); // 3 max - 1 used
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('EXECUTES: Allows multiple requests within limit', () => {
      const key = 'test-key-2';

      const result1 = checkRateLimit(key, config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit(key, config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = checkRateLimit(key, config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('EXECUTES: Blocks request when limit exceeded', () => {
      const key = 'test-key-3';

      // Use up the limit
      checkRateLimit(key, config);
      checkRateLimit(key, config);
      checkRateLimit(key, config);

      // Should be blocked
      const result = checkRateLimit(key, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('EXECUTES: Cleans up expired entries', async () => {
      const key = 'test-key-cleanup';
      const shortConfig = {
        windowMs: 50, // 50ms window
        maxRequests: 3,
      };

      // Use up the limit
      checkRateLimit(key, shortConfig); // count=1, remaining=2
      checkRateLimit(key, shortConfig); // count=2, remaining=1
      checkRateLimit(key, shortConfig); // count=3, remaining=0

      // Verify blocked
      const blocked = checkRateLimit(key, shortConfig);
      expect(blocked.success).toBe(false);

      // Wait for expiry (50ms window + buffer)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should start fresh after expiry - line 46 delete executed
      const result = checkRateLimit(key, shortConfig);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2); // Fresh: 3 max - 1 used
    });

    it('EXECUTES: Maintains separate counters for different keys', () => {
      const result1 = checkRateLimit('user-a', config);
      const result2 = checkRateLimit('user-b', config);

      expect(result1.remaining).toBe(2);
      expect(result2.remaining).toBe(2); // Independent
    });

    it('EXECUTES: Returns consistent resetTime', () => {
      const key = 'test-key-5';

      const result1 = checkRateLimit(key, config);
      const result2 = checkRateLimit(key, config);

      expect(result1.resetTime).toBe(result2.resetTime);
    });
  });

  describe('createRateLimitResponse()', () => {
    it('EXECUTES: Creates 429 response with correct headers', () => {
      const resetTime = Date.now() + 60000; // 60 seconds from now

      const response = createRateLimitResponse(resetTime);

      expect(response.status).toBe(429);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Retry-After')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('EXECUTES: Response body contains error info', async () => {
      const resetTime = Date.now() + 30000;

      const response = createRateLimitResponse(resetTime);
      const body = await response.json();

      expect(body).toMatchObject({
        error: 'Túl sok kérés. Kérjük próbálja újra később.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      expect(body.retryAfter).toBeGreaterThan(0);
    });

    it('EXECUTES: Calculates retryAfter correctly', () => {
      const resetTime = Date.now() + 120000; // 120 seconds

      const response = createRateLimitResponse(resetTime);
      const retryAfter = parseInt(
        response.headers.get('Retry-After') || '0',
        10
      );

      expect(retryAfter).toBeGreaterThan(115); // ~120 seconds
      expect(retryAfter).toBeLessThan(125);
    });

    it('EXECUTES: X-RateLimit-Reset is in Unix time', () => {
      const resetTime = Date.now() + 60000;

      const response = createRateLimitResponse(resetTime);
      const resetHeader = response.headers.get('X-RateLimit-Reset');

      expect(resetHeader).toBeDefined();
      const resetTimestamp = parseInt(resetHeader!, 10);
      expect(resetTimestamp).toBe(Math.floor(resetTime / 1000));
    });
  });

  describe('rateLimit() - Middleware Function', () => {
    it('EXECUTES: Returns null when limit not exceeded', () => {
      const middleware = rateLimit({
        windowMs: 60000,
        maxRequests: 5,
      });

      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      const result = middleware(req);
      expect(result).toBeNull();
    });

    it('EXECUTES: Returns error response when limit exceeded', () => {
      const config = {
        windowMs: 60000,
        maxRequests: 2,
      };
      const middleware = rateLimit(config);

      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.101',
        },
      });

      // Use up limit
      middleware(req);
      middleware(req);

      // Should be blocked
      const result = middleware(req);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });

    it('EXECUTES: Uses API_DEFAULT config when not specified', () => {
      const middleware = rateLimit(); // No config

      const req = createMockNextRequest({
        url: 'https://example.com',
        headers: {
          'x-forwarded-for': '192.168.1.102',
        },
      });

      const result = middleware(req);
      expect(result).toBeNull(); // Should work with defaults
    });

    it('EXECUTES: Handles concurrent requests', () => {
      const middleware = rateLimit({
        windowMs: 60000,
        maxRequests: 10,
      });

      const results = Array.from({ length: 5 }, (_, i) => {
        const req = createMockNextRequest({
          url: 'https://example.com',
          headers: {
            'x-forwarded-for': `192.168.1.${i}`,
          },
        });
        return middleware(req);
      });

      // All should pass (different IPs)
      expect(results.every((r) => r === null)).toBe(true);
    });
  });

  describe('RATE_LIMITS - Configuration Constants', () => {
    it('EXECUTES: API_DEFAULT has correct values', () => {
      expect(RATE_LIMITS.API_DEFAULT).toEqual({
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
      });
    });

    it('EXECUTES: API_STRICT has stricter limits', () => {
      expect(RATE_LIMITS.API_STRICT).toEqual({
        windowMs: 5 * 60 * 1000,
        maxRequests: 10,
      });
    });

    it('EXECUTES: PETITION_SIGN has short window', () => {
      expect(RATE_LIMITS.PETITION_SIGN).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 5,
      });
    });

    it('EXECUTES: LOGIN has restrictive limits', () => {
      expect(RATE_LIMITS.LOGIN).toEqual({
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
      });
    });

    it('EXECUTES: All configs have valid values', () => {
      Object.values(RATE_LIMITS).forEach((config) => {
        expect(config.windowMs).toBeGreaterThan(0);
        expect(config.maxRequests).toBeGreaterThan(0);
      });
    });
  });

  describe('OWASP A04: Brute Force Protection', () => {
    it('SECURITY: Login endpoint has strict rate limiting', () => {
      const loginConfig = RATE_LIMITS.LOGIN;
      expect(loginConfig.maxRequests).toBeLessThanOrEqual(5);
      expect(loginConfig.windowMs).toBeGreaterThanOrEqual(15 * 60 * 1000);
    });

    it('SECURITY: Different IPs are tracked separately', () => {
      const middleware = rateLimit({
        windowMs: 60000,
        maxRequests: 2,
      });

      const req1 = createMockNextRequest({
        url: 'https://example.com',
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });

      const req2 = createMockNextRequest({
        url: 'https://example.com',
        headers: { 'x-forwarded-for': '10.0.0.2' },
      });

      // Both should have independent limits
      middleware(req1);
      middleware(req1);
      const blocked1 = middleware(req1);

      const allowed2 = middleware(req2);

      expect(blocked1?.status).toBe(429);
      expect(allowed2).toBeNull();
    });

    it('SECURITY: Rate limit response provides retry info', async () => {
      const resetTime = Date.now() + 60000;
      const response = createRateLimitResponse(resetTime);
      const body = await response.json();

      expect(body.retryAfter).toBeDefined();
      expect(response.headers.get('Retry-After')).toBeDefined();
    });
  });
});
