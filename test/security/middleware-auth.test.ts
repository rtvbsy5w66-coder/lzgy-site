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
      expect(content).toContain("from 'next-auth/jwt'");
      expect(content).toContain('getToken');
    });

    it('should import User_role from Prisma', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain("from '@prisma/client'");
      expect(content).toContain('User_role');
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

    it('should return 401 for unauthenticated API requests', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('401');
    });

    it('should return 403 for unauthorized API requests', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('403');
    });
  });

  describe('Route Protection Configuration', () => {
    it('should protect /admin routes', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('/admin');
      expect(content).toMatch(/\/admin.*path/);
    });

    it('should protect /api/admin routes', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('/api/admin');
    });

    it('should have matcher configuration', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('export const config');
      expect(content).toContain('matcher');
    });
  });

  describe('User Info Headers', () => {
    it('should add user ID to request headers', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('x-user-id');
    });

    it('should add user email to request headers', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('x-user-email');
    });

    it('should add user role to request headers', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('x-user-role');
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

    it('should differentiate between UI and API routes', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('isAdminRoute');
      expect(content).toContain('isAdminApiRoute');
    });
  });

  describe('Documentation and Comments', () => {
    it('should have authentication middleware documentation', () => {
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toMatch(/\/\*\*[\s\S]*Authentication.*Middleware/);
    });
  });
});
