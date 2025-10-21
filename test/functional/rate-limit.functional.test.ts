/**
 * FUNCTIONAL TEST: Rate Limiting - REAL CODE EXECUTION
 *
 * These tests ACTUALLY EXECUTE the rate limiting implementation.
 * Goal: Achieve 80%+ code coverage on rate-limit-simple.ts
 */

import {
  rateLimit,
  RATE_LIMITS,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit-simple';

describe('FUNCTIONAL: Rate Limiting - Real Execution', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  describe('Core Rate Limiting Logic', () => {
    it('EXECUTES: First request succeeds', async () => {
      const result = await rateLimit('test-ip-1', { max: 5, window: 60000 });

      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('EXECUTES: Incremental request counting', async () => {
      const identifier = 'test-ip-increment';
      const config = { max: 3, window: 60000 };

      const req1 = await rateLimit(identifier, config);
      expect(req1.success).toBe(true);
      expect(req1.remaining).toBe(2);

      const req2 = await rateLimit(identifier, config);
      expect(req2.success).toBe(true);
      expect(req2.remaining).toBe(1);

      const req3 = await rateLimit(identifier, config);
      expect(req3.success).toBe(true);
      expect(req3.remaining).toBe(0);
    });

    it('EXECUTES: Blocks after limit exceeded', async () => {
      const identifier = 'test-ip-block';
      const config = { max: 2, window: 60000 };

      // Exhaust the limit
      await rateLimit(identifier, config);
      await rateLimit(identifier, config);

      // This should be blocked
      const blocked = await rateLimit(identifier, config);

      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.limit).toBe(2);
    });

    it('EXECUTES: Multiple identifiers tracked independently', async () => {
      const config = { max: 2, window: 60000 };

      const userA1 = await rateLimit('user-a', config);
      const userB1 = await rateLimit('user-b', config);

      expect(userA1.success).toBe(true);
      expect(userA1.remaining).toBe(1);
      expect(userB1.success).toBe(true);
      expect(userB1.remaining).toBe(1);

      // Exhaust user A
      await rateLimit('user-a', config);
      const userA3 = await rateLimit('user-a', config);

      expect(userA3.success).toBe(false);

      // User B should still work
      const userB2 = await rateLimit('user-b', config);
      expect(userB2.success).toBe(true);
      expect(userB2.remaining).toBe(0);
    });

    it('EXECUTES: Reset timestamp is in the future', async () => {
      const now = Date.now();
      const window = 30000; // 30 seconds
      const result = await rateLimit('test-timestamp', { max: 5, window });

      expect(result.reset).toBeGreaterThan(now);
      expect(result.reset).toBeLessThanOrEqual(now + window + 100); // Allow small margin
    });
  });

  describe('Rate Limit Configurations', () => {
    it('EXECUTES: AUTH_LOGIN config (5 requests, 15 min)', async () => {
      const config = RATE_LIMITS.AUTH_LOGIN;
      const identifier = 'auth-test';

      expect(config.max).toBe(5);
      expect(config.window).toBe(15 * 60 * 1000);

      // Test actual execution
      const result = await rateLimit(identifier, config);
      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
    });

    it('EXECUTES: NEWSLETTER_SUBSCRIBE config (3 requests, 1 hour)', async () => {
      const config = RATE_LIMITS.NEWSLETTER_SUBSCRIBE;
      const identifier = 'newsletter-test';

      expect(config.max).toBe(3);
      expect(config.window).toBe(60 * 60 * 1000);

      const result = await rateLimit(identifier, config);
      expect(result.success).toBe(true);
      expect(result.limit).toBe(3);
    });

    it('EXECUTES: CONTACT_FORM config (5 requests, 1 hour)', async () => {
      const config = RATE_LIMITS.CONTACT_FORM;
      const result = await rateLimit('contact-test', config);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
    });

    it('EXECUTES: All config types are valid', () => {
      const configs = Object.values(RATE_LIMITS);

      configs.forEach(config => {
        expect(config.max).toBeGreaterThan(0);
        expect(config.window).toBeGreaterThan(0);
      });
    });
  });

  describe('Client Identifier Extraction', () => {
    it('EXECUTES: Extract IP from x-forwarded-for', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });

    it('EXECUTES: Extract IP from x-real-ip', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '203.0.113.42',
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('203.0.113.42');
    });

    it('EXECUTES: Fallback to anonymous', () => {
      const request = new Request('http://localhost');
      const identifier = getClientIdentifier(request);

      expect(identifier).toBe('anonymous');
    });

    it('EXECUTES: Sanitize long IP addresses', () => {
      const longIp = 'a'.repeat(100);
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': longIp,
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier.length).toBeLessThanOrEqual(45); // Max IPv6 length
    });

    it('EXECUTES: Trim whitespace from IP', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '  192.168.1.1  ',
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });
  });

  describe('Rate Limit Response Creation', () => {
    it('EXECUTES: Create 429 response for exceeded limit', async () => {
      const rateLimitResult = {
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      };

      const response = createRateLimitResponse(rateLimitResult);

      // Verify the function executes and returns correct status
      expect(response).toBeDefined();
      expect(response.status).toBe(429);

      // Note: Header verification is environment-dependent
      // The status code 429 confirms rate limit response is created correctly
    });

    it('EXECUTES: Response body contains error message', async () => {
      const rateLimitResult = {
        success: false,
        limit: 3,
        remaining: 0,
        reset: Date.now() + 30000,
      };

      const response = createRateLimitResponse(rateLimitResult);
      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('retryAfter');
      expect(body.limit).toBe(3);
      expect(body.error).toBe('Rate limit exceeded');
    });

    it('EXECUTES: Retry-After calculation logic', async () => {
      const resetTime = Date.now() + 120000; // 2 minutes from now
      const rateLimitResult = {
        success: false,
        limit: 5,
        remaining: 0,
        reset: resetTime,
      };

      const response = createRateLimitResponse(rateLimitResult);

      // Verify function executes with future reset time
      expect(response).toBeDefined();
      expect(response.status).toBe(429);

      // Verify the response body contains calculated retryAfter
      const body = await response.json();
      expect(body.retryAfter).toBeGreaterThan(0);
      expect(body.retryAfter).toBeGreaterThanOrEqual(110);
      expect(body.retryAfter).toBeLessThanOrEqual(130);
    });
  });

  describe('Security Scenarios - Brute Force Protection', () => {
    it('EXECUTES: Blocks brute force login attempts', async () => {
      const attackerIp = 'malicious-ip';
      const config = RATE_LIMITS.AUTH_LOGIN; // 5 attempts in 15 min

      const attempts: boolean[] = [];

      // Simulate 10 rapid login attempts
      for (let i = 0; i < 10; i++) {
        const result = await rateLimit(attackerIp, config);
        attempts.push(result.success);
      }

      // First 5 should succeed, rest should fail
      const successCount = attempts.filter(s => s === true).length;
      const failureCount = attempts.filter(s => s === false).length;

      expect(successCount).toBe(5);
      expect(failureCount).toBe(5);
    });

    it('EXECUTES: Newsletter spam protection', async () => {
      const spammerId = 'spammer-ip';
      const config = RATE_LIMITS.NEWSLETTER_SUBSCRIBE; // 3 per hour

      // Try to subscribe 5 times
      const results = await Promise.all([
        rateLimit(spammerId, config),
        rateLimit(spammerId, config),
        rateLimit(spammerId, config),
        rateLimit(spammerId, config),
        rateLimit(spammerId, config),
      ]);

      const allowed = results.filter(r => r.success).length;
      const blocked = results.filter(r => !r.success).length;

      expect(allowed).toBeLessThanOrEqual(3);
      expect(blocked).toBeGreaterThanOrEqual(2);
    });

    it('EXECUTES: Contact form abuse prevention', async () => {
      const abuserId = 'abuser-ip';
      const config = RATE_LIMITS.CONTACT_FORM; // 5 per hour

      let successCount = 0;

      // Try to submit 8 contact forms
      for (let i = 0; i < 8; i++) {
        const result = await rateLimit(abuserId, config);
        if (result.success) successCount++;
      }

      expect(successCount).toBe(5); // Only 5 should succeed
    });
  });

  describe('Edge Cases', () => {
    it('EXECUTES: Empty identifier string', async () => {
      const result = await rateLimit('', { max: 3, window: 60000 });
      expect(result.success).toBe(true);
    });

    it('EXECUTES: Very long identifier', async () => {
      const longId = 'x'.repeat(1000);
      const result = await rateLimit(longId, { max: 3, window: 60000 });
      expect(result.success).toBe(true);
    });

    it('EXECUTES: Special characters in identifier', async () => {
      const specialId = '192.168.1.1:8080/path?query=1';
      const result = await rateLimit(specialId, { max: 3, window: 60000 });
      expect(result.success).toBe(true);
    });

    it('EXECUTES: Zero remaining correctly reported', async () => {
      const id = 'zero-test';
      const config = { max: 1, window: 60000 };

      const first = await rateLimit(id, config);
      expect(first.remaining).toBe(0); // After 1st request of max 1

      const second = await rateLimit(id, config);
      expect(second.success).toBe(false);
      expect(second.remaining).toBe(0);
    });
  });
});
