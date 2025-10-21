// test/functional/auth-middleware.functional.test.ts
/**
 * OWASP A07: Identification and Authentication Failures - Functional Tests
 *
 * Tests authentication middleware for:
 * - Session validation
 * - Role-based access control (RBAC)
 * - API key validation for service-to-service calls
 * - Error handling and proper HTTP status codes
 *
 * Coverage target: 90%+
 */

// Mock next-auth BEFORE any imports that use it
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

import { NextRequest } from 'next/server';
import { requireAuth, requireAdminAuth, validateApiKey } from '@/lib/auth-middleware';
import { User_role } from '@prisma/client';
import { createMockNextRequest } from '../utils/next-test-helpers';
import { getServerSession } from 'next-auth/next';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('OWASP A07: Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env.INTERNAL_API_KEY;
  });

  describe('requireAuth() - Session Validation', () => {
    it('SECURITY: Rejects request without session (401 UNAUTHORIZED)', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockNextRequest({ url: '/api/admin/test', method: 'GET' });
      const result = await requireAuth(req, User_role.ADMIN);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(401);

      const json = await result?.json();
      expect(json.error).toBe('Hitelesítés szükséges');
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('SECURITY: Rejects request with session but no user (401)', async () => {
      mockGetServerSession.mockResolvedValue({ user: null } as any);

      const req = createMockNextRequest({ url: '/api/admin/test', method: 'GET' });
      const result = await requireAuth(req, User_role.ADMIN);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(401);

      const json = await result?.json();
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('EXECUTES: Returns null (success) for valid ADMIN session', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: User_role.ADMIN,
        },
      } as any);

      const req = createMockNextRequest({ url: '/api/admin/test', method: 'GET' });
      const result = await requireAuth(req, User_role.ADMIN);

      expect(result).toBeNull(); // No error = success
    });

    it('EXECUTES: Returns null (success) for valid USER session when USER role required', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user-456',
          email: 'user@example.com',
          name: 'Regular User',
          role: User_role.USER,
        },
      } as any);

      const req = createMockNextRequest({ url: '/api/user/profile', method: 'GET' });
      const result = await requireAuth(req, User_role.USER);

      expect(result).toBeNull(); // No error = success
    });
  });

  describe('requireAuth() - Role-Based Access Control (RBAC)', () => {
    it('SECURITY: Rejects USER trying to access ADMIN resource (403 FORBIDDEN)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user-456',
          email: 'user@example.com',
          name: 'Regular User',
          role: User_role.USER,
        },
      } as any);

      const req = createMockNextRequest({ url: '/api/admin/secret', method: 'GET' });
      const result = await requireAuth(req, User_role.ADMIN);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);

      const json = await result?.json();
      expect(json.error).toBe('Nincs jogosultsága ehhez a művelethez');
      expect(json.code).toBe('FORBIDDEN');
    });

    it('SECURITY: ADMIN can access ADMIN resources', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: User_role.ADMIN,
        },
      } as any);

      const req = createMockNextRequest({ url: '/api/admin/users', method: 'DELETE' });
      const result = await requireAuth(req, User_role.ADMIN);

      expect(result).toBeNull(); // Success
    });

    it('SECURITY: USER cannot escalate privileges', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user-789',
          email: 'hacker@example.com',
          name: 'Hacker',
          role: User_role.USER, // User role in session
        },
      } as any);

      // Try to access admin endpoint
      const req = createMockNextRequest({ url: '/api/admin/delete-all', method: 'POST' });
      const result = await requireAuth(req, User_role.ADMIN);

      expect(result?.status).toBe(403);
      const json = await result?.json();
      expect(json.code).toBe('FORBIDDEN');
    });
  });

  describe('requireAuth() - Error Handling', () => {
    it('EXECUTES: Returns 500 when getServerSession throws error', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Database connection failed'));

      const req = createMockNextRequest({ url: '/api/admin/test', method: 'GET' });
      const result = await requireAuth(req, User_role.ADMIN);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(500);

      const json = await result?.json();
      expect(json.error).toBe('Hitelesítési hiba');
      expect(json.code).toBe('AUTH_ERROR');
    });

    it('EXECUTES: Logs error when exception occurs', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetServerSession.mockRejectedValue(new Error('Network timeout'));

      const req = createMockNextRequest({ url: '/api/admin/test', method: 'GET' });
      await requireAuth(req, User_role.ADMIN);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Auth Middleware] Error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('requireAdminAuth()', () => {
    it('EXECUTES: Calls requireAuth with ADMIN role', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: User_role.ADMIN,
        },
      } as any);

      const req = createMockNextRequest({ url: '/api/admin/dashboard', method: 'GET' });
      const result = await requireAdminAuth(req);

      expect(result).toBeNull(); // Success
    });

    it('SECURITY: Rejects non-admin users', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user-456',
          email: 'user@example.com',
          role: User_role.USER,
        },
      } as any);

      const req = createMockNextRequest({ url: '/api/admin/dashboard', method: 'GET' });
      const result = await requireAdminAuth(req);

      expect(result?.status).toBe(403);
    });

    it('SECURITY: Rejects unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockNextRequest({ url: '/api/admin/dashboard', method: 'GET' });
      const result = await requireAdminAuth(req);

      expect(result?.status).toBe(401);
    });
  });

  describe('validateApiKey() - Service-to-Service Authentication', () => {
    it('EXECUTES: Returns true for valid API key', () => {
      process.env.INTERNAL_API_KEY = 'super-secret-key-12345';

      const req = createMockNextRequest({
        url: '/api/internal/sync',
        method: 'POST',
        headers: { 'x-api-key': 'super-secret-key-12345' },
      });

      const result = validateApiKey(req);
      expect(result).toBe(true);
    });

    it('SECURITY: Returns false for invalid API key', () => {
      process.env.INTERNAL_API_KEY = 'super-secret-key-12345';

      const req = createMockNextRequest({
        url: '/api/internal/sync',
        method: 'POST',
        headers: { 'x-api-key': 'wrong-key' },
      });

      const result = validateApiKey(req);
      expect(result).toBe(false);
    });

    it('SECURITY: Returns false when API key header is missing', () => {
      process.env.INTERNAL_API_KEY = 'super-secret-key-12345';

      const req = createMockNextRequest({
        url: '/api/internal/sync',
        method: 'POST',
      });

      const result = validateApiKey(req);
      expect(result).toBe(false);
    });

    it('SECURITY: Returns false when INTERNAL_API_KEY env var not set', () => {
      delete process.env.INTERNAL_API_KEY;

      const req = createMockNextRequest({
        url: '/api/internal/sync',
        method: 'POST',
        headers: { 'x-api-key': 'some-key' },
      });

      const result = validateApiKey(req);
      expect(result).toBe(false);
    });

    it('SECURITY: Returns false when API key is empty string', () => {
      process.env.INTERNAL_API_KEY = 'super-secret-key-12345';

      const req = createMockNextRequest({
        url: '/api/internal/sync',
        method: 'POST',
        headers: { 'x-api-key': '' },
      });

      const result = validateApiKey(req);
      expect(result).toBe(false);
    });

    it('SECURITY: Prevents timing attacks by using strict equality', () => {
      process.env.INTERNAL_API_KEY = 'abc123';

      // Similar but not equal key
      const req = createMockNextRequest({
        url: '/api/internal/sync',
        method: 'POST',
        headers: { 'x-api-key': 'abc124' },
      });

      const result = validateApiKey(req);
      expect(result).toBe(false);
    });
  });

  describe('OWASP A07 Security Scenarios', () => {
    it('SECURITY: Session hijacking prevented - no session = no access', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockNextRequest({
        url: '/api/admin/delete-user',
        method: 'DELETE',
      });

      const result = await requireAdminAuth(req);

      expect(result?.status).toBe(401);
      const json = await result?.json();
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('SECURITY: Privilege escalation prevented - USER cannot become ADMIN', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'attacker-999',
          email: 'attacker@evil.com',
          role: User_role.USER,
        },
      } as any);

      const req = createMockNextRequest({
        url: '/api/admin/grant-permissions',
        method: 'POST',
      });

      const result = await requireAdminAuth(req);

      expect(result?.status).toBe(403);
      const json = await result?.json();
      expect(json.code).toBe('FORBIDDEN');
    });

    it('SECURITY: API key brute force prevented - empty/null keys rejected', () => {
      process.env.INTERNAL_API_KEY = 'real-key';

      const emptyKeyReq = createMockNextRequest({
        url: '/api/internal/data',
        method: 'GET',
        headers: { 'x-api-key': '' },
      });

      expect(validateApiKey(emptyKeyReq)).toBe(false);
    });

    it('SECURITY: Proper error codes prevent information disclosure', async () => {
      // Unauthenticated = 401, not 403 (which would reveal resource exists)
      mockGetServerSession.mockResolvedValue(null);

      const req = createMockNextRequest({ url: '/api/admin/secret', method: 'GET' });
      const result = await requireAdminAuth(req);

      expect(result?.status).toBe(401);

      // Wrong role = 403 (user is authenticated but lacks permission)
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', email: 'user@test.com', role: User_role.USER },
      } as any);

      const req2 = createMockNextRequest({ url: '/api/admin/secret', method: 'GET' });
      const result2 = await requireAdminAuth(req2);

      expect(result2?.status).toBe(403);
    });
  });
});
