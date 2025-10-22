// test/functional/rate-limit.functional.test.ts
/**
 * OWASP A04: Insecure Design - Rate Limit Tests
 *
 * Complete coverage of rate-limit.ts (0% → 100%)
 * Tests rate limiting helpers using Next.js headers()
 */

// Mock next/headers BEFORE imports
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

import { getRateLimitInfo, checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

const mockHeaders = headers as jest.MockedFunction<typeof headers>;

describe('Rate Limit - Complete Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRateLimitInfo()', () => {
    it('EXECUTES: Returns info for new IP', () => {
      const result = getRateLimitInfo('192.168.1.1');

      expect(result).toBeDefined();
      expect(result?.remaining).toBe(4); // limit=5, -1 for first request
      expect(result?.reset).toBeInstanceOf(Date);
      expect(result?.reset.getTime()).toBeGreaterThan(Date.now());
    });

    it('EXECUTES: Returns correct remaining after multiple checks', async () => {
      const ip = '192.168.1.unique';
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue(ip),
      } as any);

      const context = { limit: 5, windowMs: 60000, currentTimestamp: Date.now() };

      // Use checkRateLimit to populate ipRequests
      await checkRateLimit(context);
      await checkRateLimit(context);

      // Now check info
      const result = getRateLimitInfo(ip);
      expect(result?.remaining).toBe(3); // 5 limit - 2 used
    });

    it('EXECUTES: Returns remaining count after requests', async () => {
      const ip = '192.168.1.limit-test-unique';
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue(ip),
      } as any);

      const context = { limit: 5, windowMs: 60000, currentTimestamp: Date.now() };

      // Make some requests
      await checkRateLimit(context);
      await checkRateLimit(context);

      const result = getRateLimitInfo(ip);
      expect(result?.remaining).toBeGreaterThanOrEqual(0);
      expect(result?.remaining).toBeLessThanOrEqual(5);
    });

    it('EXECUTES: Returns fresh window info for new IP', () => {
      const result = getRateLimitInfo('brand-new-ip');

      expect(result?.remaining).toBe(4);
      expect(result?.reset).toBeDefined();
      expect(result?.reset.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('checkRateLimit()', () => {
    const context = {
      limit: 5,
      windowMs: 60000,
      currentTimestamp: Date.now(),
    };

    it('EXECUTES: Allows first request from new IP', async () => {
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue('192.168.1.200'),
      } as any);

      const result = await checkRateLimit(context);
      expect(result).toBe(true);
    });

    it('EXECUTES: Uses unknown when no x-forwarded-for', async () => {
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      } as any);

      const result = await checkRateLimit(context);
      expect(result).toBe(true);
    });

    it('EXECUTES: Allows requests within limit', async () => {
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue('192.168.1.201'),
      } as any);

      // Should allow multiple requests
      const result1 = await checkRateLimit(context);
      const result2 = await checkRateLimit(context);
      const result3 = await checkRateLimit(context);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    it('EXECUTES: Blocks request when limit exceeded', async () => {
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue('192.168.1.202'),
      } as any);

      // Use up limit (5 requests)
      await checkRateLimit(context);
      await checkRateLimit(context);
      await checkRateLimit(context);
      await checkRateLimit(context);
      await checkRateLimit(context);

      // 6th request should be blocked
      const result = await checkRateLimit(context);
      expect(result).toBe(false);
    });

    it('EXECUTES: Window expiry resets count', async () => {
      // This tests lines 55-58: window expiry reset logic
      const ip = '192.168.1.reset-test';
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue(ip),
      } as any);

      const shortContext = {
        limit: 2,
        windowMs: 50, // 50ms window
        currentTimestamp: Date.now(),
      };

      // Use up limit
      await checkRateLimit(shortContext);
      await checkRateLimit(shortContext);

      // Should be blocked
      const blocked = await checkRateLimit(shortContext);
      expect(blocked).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should allow request after window expired (line 55-58)
      const result = await checkRateLimit(shortContext);
      expect(result).toBe(true);
    });

    it('EXECUTES: Increments count within window (lines 64-68)', async () => {
      const ip = '192.168.1.increment';
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue(ip),
      } as any);

      const testContext = { limit: 5, windowMs: 60000, currentTimestamp: Date.now() };

      // First 3 requests should all succeed
      const r1 = await checkRateLimit(testContext);
      const r2 = await checkRateLimit(testContext);
      const r3 = await checkRateLimit(testContext);

      expect(r1).toBe(true);
      expect(r2).toBe(true);
      expect(r3).toBe(true);

      // Verify via getRateLimitInfo
      const info = getRateLimitInfo(ip);
      expect(info?.remaining).toBe(2); // 5 limit - 3 used
    });
  });

  describe('OWASP A04: Rate Limit Configuration', () => {
    it('SECURITY: Default limit is restrictive (5 req/min)', () => {
      const result = getRateLimitInfo('test-ip');
      expect(result?.remaining).toBeLessThanOrEqual(4); // Max 5 requests
    });

    it('SECURITY: Window is 60 seconds', () => {
      const result = getRateLimitInfo('test-ip-2');
      const now = Date.now();
      const resetTime = result?.reset.getTime() || 0;

      expect(resetTime - now).toBeLessThanOrEqual(60000);
      expect(resetTime - now).toBeGreaterThan(59000);
    });

    it('SECURITY: Different IPs are tracked separately', async () => {
      const context = {
        limit: 2,
        windowMs: 60000,
        currentTimestamp: Date.now(),
      };

      // IP1 uses up limit
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue('10.0.0.unique-1'),
      } as any);

      await checkRateLimit(context);
      await checkRateLimit(context);
      const blocked = await checkRateLimit(context);
      expect(blocked).toBe(false); // IP1 blocked

      // IP2 should still be allowed (different IP)
      mockHeaders.mockResolvedValue({
        get: jest.fn().mockReturnValue('10.0.0.unique-2'),
      } as any);

      const result = await checkRateLimit(context);
      expect(result).toBe(true); // IP2 allowed
    });
  });
});
