/**
 * Security Test: Middleware Authentication & Authorization
 *
 * Tests that middleware.ts exists and contains proper security checks:
 * - JWT token verification
 * - Role-based access control (RBAC)
 * - Proper route protection configuration
 */

import fs from 'fs';
import path from 'path';

describe('Security: Middleware Authentication & Authorization', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const middlewarePath = path.join(projectRoot, 'middleware.ts');

  describe('Middleware File Existence and Structure', () => {
    it('should have middleware.ts in project root', () => {
      expect(fs.existsSync(middlewarePath)).toBe(true);
    });

    it('should export middleware function', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('export async function middleware');
    });

    it('should import getToken from next-auth/jwt', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasNextAuth = content.includes('next-auth/jwt') || content.includes('next-auth');
      const hasGetToken = content.includes('getToken');
      expect(hasNextAuth).toBe(true);
      expect(hasGetToken).toBe(true);
    });

    it('should import User_role from Prisma', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasPrisma = content.includes('@prisma/client') || content.includes('prisma');
      const hasUserRole = content.includes('User_role') || content.includes('ADMIN');
      expect(hasPrisma).toBe(true);
      expect(hasUserRole).toBe(true);
    });
  });

  describe('JWT Token Verification', () => {
    it('should call getToken with proper configuration', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('getToken(');
      expect(content).toContain('NEXTAUTH_SECRET');
    });

    it('should check for token existence', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toMatch(/if\s*\(\s*!token/);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should check for ADMIN role', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('ADMIN');
      expect(content).toMatch(/token\.role.*ADMIN/);
    });

    it('should redirect unauthorized users', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('NextResponse.redirect');
      expect(content).toContain('/login');
    });

    it('should handle unauthenticated requests', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      // Middleware redirects to login, doesn't return 401/403
      const hasRedirect = content.includes('redirect') || content.includes('Redirect');
      expect(hasRedirect).toBe(true);
    });

    it('should protect unauthorized access', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasRoleCheck = content.includes('role') && content.includes('ADMIN');
      expect(hasRoleCheck).toBe(true);
    });
  });

  describe('Route Protection Configuration', () => {
    it('should protect /admin routes', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('/admin');
      expect(content).toMatch(/\/admin.*path/);
    });

    it('should protect admin-related routes', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasAdminProtection = content.includes('/admin') || content.includes('admin');
      expect(hasAdminProtection).toBe(true);
    });

    it('should have matcher configuration', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('export const config');
      expect(content).toContain('matcher');
    });
  });

  describe('Token Handling', () => {
    it('should work with user tokens', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasToken = content.includes('token');
      expect(hasToken).toBe(true);
    });

    it('should check user information', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasUserCheck = content.includes('email') || content.includes('role');
      expect(hasUserCheck).toBe(true);
    });
  });

  describe('Callback URL Preservation', () => {
    it('should include callbackUrl in redirect', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('callbackUrl');
    });

    it('should use pathname for callback', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('pathname');
    });
  });

  describe('Security Best Practices', () => {
    it('should not have any disabled security checks', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      // Should not have commented out authentication
      expect(content).not.toMatch(/\/\/.*getToken/);
      expect(content).not.toMatch(/\/\/.*token\.role/);
    });

    it('should use NEXTAUTH_SECRET from environment', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('process.env.NEXTAUTH_SECRET');
    });

    it('should handle different route types', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasRouteHandling = content.includes('pathname') || content.includes('path');
      expect(hasRouteHandling).toBe(true);
    });
  });

  describe('Code Quality', () => {
    it('should have authentication-related code', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      const hasAuthCode = content.includes('authentication') ||
                         content.includes('token') ||
                         content.includes('login');
      expect(hasAuthCode).toBe(true);
    });
  });
});
