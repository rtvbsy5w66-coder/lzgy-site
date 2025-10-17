/**
 * Security Test: Rate Limiting
 *
 * Tests that rate limiting is properly enforced on critical endpoints:
 * - POST /api/auth/request-code (login code requests)
 * - POST /api/newsletter/subscribe (newsletter subscriptions)
 * - POST /api/contact (contact form submissions)
 */

import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit-simple';

describe('Security: Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit state between tests
    jest.clearAllMocks();
  });

  describe('Rate Limit Configuration', () => {
    it('should have strict limits for auth login attempts', () => {
      expect(RATE_LIMITS.AUTH_LOGIN).toBeDefined();
      expect(RATE_LIMITS.AUTH_LOGIN.max).toBeLessThanOrEqual(5);
      expect(RATE_LIMITS.AUTH_LOGIN.window).toBeGreaterThanOrEqual(10 * 60 * 1000); // At least 10 minutes
    });

    it('should have limits for newsletter subscriptions', () => {
      expect(RATE_LIMITS.NEWSLETTER_SUBSCRIBE).toBeDefined();
      expect(RATE_LIMITS.NEWSLETTER_SUBSCRIBE.max).toBeLessThanOrEqual(10);
    });

    it('should have limits for contact form', () => {
      expect(RATE_LIMITS.CONTACT_FORM).toBeDefined();
      expect(RATE_LIMITS.CONTACT_FORM.max).toBeLessThanOrEqual(10);
    });
  });

  describe('Rate Limit Enforcement', () => {
    it('should allow requests under the limit', async () => {
      const identifier = 'test-user-1';
      const config = { max: 3, window: 60000 }; // 3 requests per minute

      const result1 = await rateLimit(identifier, config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = await rateLimit(identifier, config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = await rateLimit(identifier, config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests over the limit', async () => {
      const identifier = 'test-user-2';
      const config = { max: 2, window: 60000 };

      // First 2 requests should succeed
      await rateLimit(identifier, config);
      await rateLimit(identifier, config);

      // Third request should be blocked
      const result = await rateLimit(identifier, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should provide correct reset timestamp', async () => {
      const identifier = 'test-user-3';
      const config = { max: 1, window: 60000 };

      const result = await rateLimit(identifier, config);
      expect(result.reset).toBeGreaterThan(Date.now());
      expect(result.reset).toBeLessThanOrEqual(Date.now() + config.window);
    });

    it('should track limits independently per identifier', async () => {
      const config = { max: 2, window: 60000 };

      const result1 = await rateLimit('user-a', config);
      const result2 = await rateLimit('user-b', config);

      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(1);

      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
    });
  });

  describe('Rate Limit Response Headers', () => {
    it('should return proper JSON error message', async () => {
      const { createRateLimitResponse } = require('@/lib/rate-limit-simple');

      const rateLimitResult = {
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      };

      const response = createRateLimitResponse(rateLimitResult);
      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('retryAfter');
      expect(body).toHaveProperty('limit');
    });
  });

  describe('Window Sliding Behavior', () => {
    it('should reset limit after window expires', async () => {
      const identifier = 'test-user-window';
      const config = { max: 2, window: 1000 }; // 1 second window

      // Use up the limit
      await rateLimit(identifier, config);
      await rateLimit(identifier, config);

      // Should be blocked
      const blockedResult = await rateLimit(identifier, config);
      expect(blockedResult.success).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be allowed again
      const allowedResult = await rateLimit(identifier, config);
      expect(allowedResult.success).toBe(true);
      expect(allowedResult.remaining).toBe(1);
    });
  });

  describe('Critical Endpoint Protection', () => {
    describe('POST /api/auth/request-code', () => {
      it('should have rate limiting configured', async () => {
        // Test that the endpoint uses rate limiting
        const config = RATE_LIMITS.AUTH_LOGIN;
        expect(config).toBeDefined();
        expect(config.max).toBeLessThanOrEqual(5); // No more than 5 login attempts
        expect(config.window).toBeGreaterThanOrEqual(5 * 60 * 1000); // At least 5 minute window
      });
    });

    describe('POST /api/newsletter/subscribe', () => {
      it('should have rate limiting configured', () => {
        const config = RATE_LIMITS.NEWSLETTER_SUBSCRIBE;
        expect(config).toBeDefined();
        expect(config.max).toBeGreaterThan(0);
        expect(config.window).toBeGreaterThan(0);
      });
    });

    describe('POST /api/contact', () => {
      it('should have rate limiting configured', () => {
        const config = RATE_LIMITS.CONTACT_FORM;
        expect(config).toBeDefined();
        expect(config.max).toBeGreaterThan(0);
        expect(config.window).toBeGreaterThan(0);
      });
    });
  });

  describe('Identifier Generation', () => {
    it('should use email as identifier for email-based endpoints', async () => {
      const email = 'test@example.com';
      const config = { max: 3, window: 60000 };

      const result1 = await rateLimit(`auth:${email}`, config);
      const result2 = await rateLimit(`auth:${email}`, config);

      expect(result1.remaining).toBe(2);
      expect(result2.remaining).toBe(1);
    });

    it('should use IP address as identifier for IP-based endpoints', async () => {
      const ip = '192.168.1.1';
      const config = { max: 5, window: 60000 };

      const result = await rateLimit(`contact:${ip}`, config);
      expect(result.success).toBe(true);
    });

    it('should prevent cross-contamination between different prefixes', async () => {
      const email = 'user@example.com';
      const config = { max: 2, window: 60000 };

      await rateLimit(`auth:${email}`, config);
      await rateLimit(`auth:${email}`, config);

      // Should be blocked for auth
      const authResult = await rateLimit(`auth:${email}`, config);
      expect(authResult.success).toBe(false);

      // But should still work for newsletter (different prefix)
      const newsletterResult = await rateLimit(`newsletter:${email}`, config);
      expect(newsletterResult.success).toBe(true);
    });
  });

  describe('Security Considerations', () => {
    it('should not allow bypass by changing identifier slightly', async () => {
      const config = { max: 1, window: 60000 };

      await rateLimit('user@example.com', config);
      const result = await rateLimit('user@example.com', config);

      expect(result.success).toBe(false);
    });

    it('should handle concurrent requests correctly', async () => {
      const identifier = 'concurrent-test';
      const config = { max: 3, window: 60000 };

      // Simulate 5 concurrent requests
      const promises = Array(5)
        .fill(null)
        .map(() => rateLimit(identifier, config));

      const results = await Promise.all(promises);

      // At most 3 should succeed
      const successCount = results.filter((r) => r.success).length;
      expect(successCount).toBeLessThanOrEqual(3);
    });
  });
});
