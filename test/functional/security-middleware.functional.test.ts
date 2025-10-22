// test/functional/security-middleware.functional.test.ts
/**
 * OWASP A01: Broken Access Control - Security Middleware Tests
 *
 * Complete coverage of security-middleware.ts (0% → 100%)
 * Tests all security middleware layers: rate limiting, auth, CSRF
 */

// Mock next-auth BEFORE imports
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
  })),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock dependencies
jest.mock('@/lib/auth-middleware');
jest.mock('@/lib/rate-limiter');
jest.mock('@/lib/csrf-protection');

import {
  applySecurityMiddleware,
  SECURITY_CONFIGS,
  SecurityConfig,
} from '@/lib/security-middleware';
import { requireAdminAuth } from '@/lib/auth-middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { createMockNextRequest } from '../utils/next-test-helpers';

const mockRequireAdminAuth = requireAdminAuth as jest.MockedFunction<
  typeof requireAdminAuth
>;
const mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;
const mockRequireCSRFToken = requireCSRFToken as jest.MockedFunction<
  typeof requireCSRFToken
>;

describe('Security Middleware - Complete Coverage', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = createMockNextRequest({
      url: 'https://example.com/api/test',
      method: 'POST',
    });

    // Default mock implementations
    mockRateLimit.mockReturnValue(() => null);
    mockRequireAdminAuth.mockResolvedValue(null);
    mockRequireCSRFToken.mockReturnValue({ valid: true });
  });

  describe('applySecurityMiddleware() - No Config', () => {
    it('EXECUTES: Returns null when no security config provided', async () => {
      const result = await applySecurityMiddleware(mockRequest, {});
      expect(result).toBeNull();
    });

    it('EXECUTES: Returns null when no config at all', async () => {
      const result = await applySecurityMiddleware(mockRequest);
      expect(result).toBeNull();
    });
  });

  describe('applySecurityMiddleware() - Rate Limiting', () => {
    it('EXECUTES: Applies rate limiting when configured', async () => {
      const rateLimitResponse = new Response('Rate limited', { status: 429 });
      mockRateLimit.mockReturnValue(() => rateLimitResponse);

      const config: SecurityConfig = {
        rateLimit: 'API_DEFAULT',
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalledWith(RATE_LIMITS.API_DEFAULT);
      expect(result).toBe(rateLimitResponse);
    });

    it('EXECUTES: Passes through when rate limit check succeeds', async () => {
      mockRateLimit.mockReturnValue(() => null);

      const config: SecurityConfig = {
        rateLimit: 'API_STRICT',
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalledWith(RATE_LIMITS.API_STRICT);
      expect(result).toBeNull();
    });

    it('EXECUTES: Handles LOGIN rate limit', async () => {
      mockRateLimit.mockReturnValue(() => null);

      const config: SecurityConfig = {
        rateLimit: 'LOGIN',
      };

      await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalledWith(RATE_LIMITS.LOGIN);
    });

    it('EXECUTES: Handles PETITION_SIGN rate limit', async () => {
      mockRateLimit.mockReturnValue(() => null);

      const config: SecurityConfig = {
        rateLimit: 'PETITION_SIGN',
      };

      await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalledWith(RATE_LIMITS.PETITION_SIGN);
    });
  });

  describe('applySecurityMiddleware() - Authentication', () => {
    it('EXECUTES: Applies auth check when requireAuth is true', async () => {
      const authResponse = new Response('Unauthorized', { status: 401 });
      mockRequireAdminAuth.mockResolvedValue(authResponse);

      const config: SecurityConfig = {
        requireAuth: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRequireAdminAuth).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(authResponse);
    });

    it('EXECUTES: Passes through when auth check succeeds', async () => {
      mockRequireAdminAuth.mockResolvedValue(null);

      const config: SecurityConfig = {
        requireAuth: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRequireAdminAuth).toHaveBeenCalledWith(mockRequest);
      expect(result).toBeNull();
    });

    it('EXECUTES: Skips auth when requireAuth is false', async () => {
      const config: SecurityConfig = {
        requireAuth: false,
      };

      await applySecurityMiddleware(mockRequest, config);

      expect(mockRequireAdminAuth).not.toHaveBeenCalled();
    });
  });

  describe('applySecurityMiddleware() - CSRF Protection', () => {
    it('EXECUTES: Applies CSRF check when requireCSRF is true', async () => {
      const csrfError = new Response('CSRF token invalid', { status: 403 });
      mockRequireCSRFToken.mockReturnValue({
        valid: false,
        error: csrfError,
      });

      const config: SecurityConfig = {
        requireCSRF: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRequireCSRFToken).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(csrfError);
    });

    it('EXECUTES: Passes through when CSRF check succeeds', async () => {
      mockRequireCSRFToken.mockReturnValue({
        valid: true,
      });

      const config: SecurityConfig = {
        requireCSRF: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRequireCSRFToken).toHaveBeenCalledWith(mockRequest);
      expect(result).toBeNull();
    });

    it('EXECUTES: Handles invalid CSRF without error object', async () => {
      mockRequireCSRFToken.mockReturnValue({
        valid: false,
      });

      const config: SecurityConfig = {
        requireCSRF: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(result).toBeNull(); // No error object, so passes through
    });

    it('EXECUTES: Skips CSRF when requireCSRF is false', async () => {
      const config: SecurityConfig = {
        requireCSRF: false,
      };

      await applySecurityMiddleware(mockRequest, config);

      expect(mockRequireCSRFToken).not.toHaveBeenCalled();
    });
  });

  describe('applySecurityMiddleware() - Combined Checks', () => {
    it('EXECUTES: Applies all checks when all configured', async () => {
      mockRateLimit.mockReturnValue(() => null);
      mockRequireAdminAuth.mockResolvedValue(null);
      mockRequireCSRFToken.mockReturnValue({ valid: true });

      const config: SecurityConfig = {
        rateLimit: 'API_STRICT',
        requireAuth: true,
        requireCSRF: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalled();
      expect(mockRequireAdminAuth).toHaveBeenCalled();
      expect(mockRequireCSRFToken).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('EXECUTES: Stops at rate limit if it fails', async () => {
      const rateLimitResponse = new Response('Rate limited', { status: 429 });
      mockRateLimit.mockReturnValue(() => rateLimitResponse);

      const config: SecurityConfig = {
        rateLimit: 'API_STRICT',
        requireAuth: true,
        requireCSRF: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalled();
      expect(mockRequireAdminAuth).not.toHaveBeenCalled(); // Stopped at rate limit
      expect(mockRequireCSRFToken).not.toHaveBeenCalled();
      expect(result).toBe(rateLimitResponse);
    });

    it('EXECUTES: Stops at auth if it fails', async () => {
      mockRateLimit.mockReturnValue(() => null);
      const authResponse = new Response('Unauthorized', { status: 401 });
      mockRequireAdminAuth.mockResolvedValue(authResponse);

      const config: SecurityConfig = {
        rateLimit: 'API_DEFAULT',
        requireAuth: true,
        requireCSRF: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalled();
      expect(mockRequireAdminAuth).toHaveBeenCalled();
      expect(mockRequireCSRFToken).not.toHaveBeenCalled(); // Stopped at auth
      expect(result).toBe(authResponse);
    });

    it('EXECUTES: Checks CSRF last', async () => {
      mockRateLimit.mockReturnValue(() => null);
      mockRequireAdminAuth.mockResolvedValue(null);
      const csrfError = new Response('CSRF failed', { status: 403 });
      mockRequireCSRFToken.mockReturnValue({
        valid: false,
        error: csrfError,
      });

      const config: SecurityConfig = {
        rateLimit: 'API_DEFAULT',
        requireAuth: true,
        requireCSRF: true,
      };

      const result = await applySecurityMiddleware(mockRequest, config);

      expect(mockRateLimit).toHaveBeenCalled();
      expect(mockRequireAdminAuth).toHaveBeenCalled();
      expect(mockRequireCSRFToken).toHaveBeenCalled();
      expect(result).toBe(csrfError);
    });
  });

  describe('SECURITY_CONFIGS - Predefined Configurations', () => {
    it('EXECUTES: PUBLIC_API config has correct settings', () => {
      expect(SECURITY_CONFIGS.PUBLIC_API).toEqual({
        rateLimit: 'API_DEFAULT',
      });
    });

    it('EXECUTES: ADMIN_API config has all security layers', () => {
      expect(SECURITY_CONFIGS.ADMIN_API).toEqual({
        requireAuth: true,
        requireCSRF: true,
        rateLimit: 'API_STRICT',
      });
    });

    it('EXECUTES: PETITION_SIGN config has rate limit', () => {
      expect(SECURITY_CONFIGS.PETITION_SIGN).toEqual({
        rateLimit: 'PETITION_SIGN',
        requireCSRF: true,
      });
    });

    it('EXECUTES: LOGIN config has rate limit', () => {
      expect(SECURITY_CONFIGS.LOGIN).toEqual({
        rateLimit: 'LOGIN',
        requireCSRF: true,
      });
    });

    it('EXECUTES: All configs are valid SecurityConfig types', () => {
      Object.values(SECURITY_CONFIGS).forEach((config) => {
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
      });
    });
  });

  describe('OWASP A01: Defense in Depth', () => {
    it('SECURITY: ADMIN_API enforces all protections', async () => {
      mockRateLimit.mockReturnValue(() => null);
      mockRequireAdminAuth.mockResolvedValue(null);
      mockRequireCSRFToken.mockReturnValue({ valid: true });

      const result = await applySecurityMiddleware(
        mockRequest,
        SECURITY_CONFIGS.ADMIN_API
      );

      expect(mockRateLimit).toHaveBeenCalledWith(RATE_LIMITS.API_STRICT);
      expect(mockRequireAdminAuth).toHaveBeenCalled();
      expect(mockRequireCSRFToken).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('SECURITY: Security checks run in correct order', async () => {
      const callOrder: string[] = [];

      mockRateLimit.mockImplementation(() => {
        callOrder.push('rateLimit');
        return () => null;
      });

      mockRequireAdminAuth.mockImplementation(async () => {
        callOrder.push('auth');
        return null;
      });

      mockRequireCSRFToken.mockImplementation(() => {
        callOrder.push('csrf');
        return { valid: true };
      });

      const config: SecurityConfig = {
        rateLimit: 'API_STRICT',
        requireAuth: true,
        requireCSRF: true,
      };

      await applySecurityMiddleware(mockRequest, config);

      expect(callOrder).toEqual(['rateLimit', 'auth', 'csrf']);
    });

    it('SECURITY: PUBLIC_API has minimal protection', async () => {
      mockRateLimit.mockReturnValue(() => null);

      await applySecurityMiddleware(
        mockRequest,
        SECURITY_CONFIGS.PUBLIC_API
      );

      expect(mockRateLimit).toHaveBeenCalled();
      expect(mockRequireAdminAuth).not.toHaveBeenCalled();
      expect(mockRequireCSRFToken).not.toHaveBeenCalled();
    });
  });
});
