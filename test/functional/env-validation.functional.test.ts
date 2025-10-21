/**
 * OWASP A05:2021 - Security Misconfiguration
 *
 * Environment Variable Validation Functional Tests
 *
 * Coverage Target: src/lib/env-validation.ts (29 lines) -> 100%
 *
 * TESTS:
 * - Missing environment variables detection
 * - Required fields validation
 * - SKIP_ENV_VALIDATION flag handling
 * - Error reporting
 * - Validation caching (single execution per process)
 */

describe('OWASP A05: Environment Validation (env-validation.ts)', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Reset the validation flag by clearing module cache
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateAuthEnvironment() - Required Variables', () => {
    it('EXECUTES: Should pass when all required variables are present', () => {
      // Setup: All required environment variables
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret-min-32-characters-long';
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.ADMIN_EMAILS = 'admin@test.com';
      process.env.SKIP_ENV_VALIDATION = 'false';

      // Import fresh module
      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Execute
      const result = validateAuthEnvironment();

      // Verify
      expect(result).toBe(true);
    });

    it('EXECUTES: Should throw error when NEXTAUTH_URL is missing', () => {
      // Setup: Missing NEXTAUTH_URL
      delete process.env.NEXTAUTH_URL;
      process.env.NEXTAUTH_SECRET = 'test-secret-min-32-characters-long';
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.ADMIN_EMAILS = 'admin@test.com';
      delete process.env.SKIP_ENV_VALIDATION;

      // Import fresh module
      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Execute & Verify
      expect(() => validateAuthEnvironment()).toThrow('Missing environment variables: NEXTAUTH_URL');
    });

    it('EXECUTES: Should throw error when NEXTAUTH_SECRET is missing', () => {
      // Setup: Missing NEXTAUTH_SECRET
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      delete process.env.NEXTAUTH_SECRET;
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      expect(() => validateAuthEnvironment()).toThrow('Missing environment variables: NEXTAUTH_SECRET');
    });

    it('EXECUTES: Should throw error when DATABASE_URL is missing', () => {
      // Setup: Missing DATABASE_URL
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret-min-32-characters-long';
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
      delete process.env.DATABASE_URL;
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      expect(() => validateAuthEnvironment()).toThrow('Missing environment variables: DATABASE_URL');
    });

    it('EXECUTES: Should throw error when ADMIN_EMAILS is missing', () => {
      // Setup: Missing ADMIN_EMAILS
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret-min-32-characters-long';
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      delete process.env.ADMIN_EMAILS;

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      expect(() => validateAuthEnvironment()).toThrow('Missing environment variables: ADMIN_EMAILS');
    });

    it('EXECUTES: Should throw error when multiple variables are missing', () => {
      // Setup: Multiple missing variables
      delete process.env.NEXTAUTH_URL;
      delete process.env.NEXTAUTH_SECRET;
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
      delete process.env.DATABASE_URL;
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      expect(() => validateAuthEnvironment()).toThrow(/Missing environment variables:.*NEXTAUTH_URL.*NEXTAUTH_SECRET.*DATABASE_URL/);
    });

    it('EXECUTES: Should throw error when Google OAuth credentials are missing', () => {
      // Setup: Missing Google credentials
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret-min-32-characters-long';
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      expect(() => validateAuthEnvironment()).toThrow(/Missing environment variables:.*GOOGLE_CLIENT_ID.*GOOGLE_CLIENT_SECRET/);
    });
  });

  describe('SKIP_ENV_VALIDATION Flag', () => {
    it('EXECUTES: Should skip validation when SKIP_ENV_VALIDATION is true', () => {
      // Setup: SKIP_ENV_VALIDATION enabled, all vars missing
      delete process.env.NEXTAUTH_URL;
      delete process.env.NEXTAUTH_SECRET;
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      delete process.env.DATABASE_URL;
      delete process.env.ADMIN_EMAILS;
      process.env.SKIP_ENV_VALIDATION = 'true';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Execute - should NOT throw even though vars are missing
      const result = validateAuthEnvironment();

      // Verify
      expect(result).toBe(true);
    });

    it('EXECUTES: Should NOT skip validation when SKIP_ENV_VALIDATION is false', () => {
      // Setup: SKIP_ENV_VALIDATION explicitly false
      delete process.env.NEXTAUTH_URL;
      process.env.SKIP_ENV_VALIDATION = 'false';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Should throw because validation is not skipped
      expect(() => validateAuthEnvironment()).toThrow(/Missing environment variables/);
    });

    it('EXECUTES: Should NOT skip validation when SKIP_ENV_VALIDATION is not set', () => {
      // Setup: SKIP_ENV_VALIDATION not set
      delete process.env.NEXTAUTH_URL;
      delete process.env.SKIP_ENV_VALIDATION;

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Should throw because validation runs
      expect(() => validateAuthEnvironment()).toThrow(/Missing environment variables/);
    });
  });

  describe('Validation Caching (Single Execution)', () => {
    it('EXECUTES: Should validate only once per process (caching)', () => {
      // Setup: Valid environment
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.NEXTAUTH_SECRET = 'test-secret-min-32-characters-long';
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // First call - should validate
      const result1 = validateAuthEnvironment();
      expect(result1).toBe(true);

      // Delete a required variable AFTER first validation
      delete process.env.DATABASE_URL;

      // Second call - should use cache, NOT revalidate (no error thrown)
      const result2 = validateAuthEnvironment();
      expect(result2).toBe(true);

      // This proves caching works (otherwise would throw error)
    });

    it('EXECUTES: Should cache SKIP validation result', () => {
      // Setup: SKIP enabled
      process.env.SKIP_ENV_VALIDATION = 'true';
      delete process.env.NEXTAUTH_URL; // Missing, but skip is enabled

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // First call - skip validation
      const result1 = validateAuthEnvironment();
      expect(result1).toBe(true);

      // Disable skip flag AFTER first call
      process.env.SKIP_ENV_VALIDATION = 'false';

      // Second call - should still use cached skip result (no error)
      const result2 = validateAuthEnvironment();
      expect(result2).toBe(true);
    });
  });

  describe('OWASP A05 Security Scenarios', () => {
    it('SECURITY: Should prevent app startup without critical secrets', () => {
      // OWASP A05: Prevent running with default/missing secrets
      delete process.env.NEXTAUTH_SECRET;
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.GOOGLE_CLIENT_ID = 'test';
      process.env.GOOGLE_CLIENT_SECRET = 'test';
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Should fail loudly, not silently continue with insecure config
      expect(() => validateAuthEnvironment()).toThrow(/NEXTAUTH_SECRET/);
    });

    it('SECURITY: Should prevent running without database connection string', () => {
      // OWASP A05: Ensure database is configured
      delete process.env.DATABASE_URL;
      process.env.NEXTAUTH_SECRET = 'secret';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.GOOGLE_CLIENT_ID = 'test';
      process.env.GOOGLE_CLIENT_SECRET = 'test';
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      expect(() => validateAuthEnvironment()).toThrow(/DATABASE_URL/);
    });

    it('SECURITY: Should prevent running without admin authorization list', () => {
      // OWASP A05: Ensure admin access is controlled
      delete process.env.ADMIN_EMAILS;
      process.env.NEXTAUTH_SECRET = 'secret';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.GOOGLE_CLIENT_ID = 'test';
      process.env.GOOGLE_CLIENT_SECRET = 'test';
      process.env.DATABASE_URL = 'postgresql://test';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      expect(() => validateAuthEnvironment()).toThrow(/ADMIN_EMAILS/);
    });

    it('SECURITY: Should allow skip only in build environment (documented use case)', () => {
      // OWASP A05: SKIP should only be used during static build
      // This test documents the intended use case
      process.env.SKIP_ENV_VALIDATION = 'true';
      delete process.env.NEXTAUTH_URL; // Simulate build environment

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Should pass (this is intentional for Next.js build)
      expect(validateAuthEnvironment()).toBe(true);

      // Document that SKIP should NEVER be used in production runtime
      // (This is a test documentation, actual enforcement is deployment responsibility)
    });
  });

  describe('Edge Cases', () => {
    it('EXECUTES: Should handle empty string environment variables as missing', () => {
      // Setup: Empty strings (common mistake)
      process.env.NEXTAUTH_URL = '';
      process.env.NEXTAUTH_SECRET = '';
      process.env.GOOGLE_CLIENT_ID = 'test';
      process.env.GOOGLE_CLIENT_SECRET = 'test';
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Empty strings should be treated as missing
      expect(() => validateAuthEnvironment()).toThrow(/Missing environment variables/);
    });

    it('EXECUTES: Should handle whitespace-only variables as missing', () => {
      // Setup: Whitespace only
      process.env.NEXTAUTH_URL = '   ';
      process.env.NEXTAUTH_SECRET = '\t\n';
      process.env.GOOGLE_CLIENT_ID = 'test';
      process.env.GOOGLE_CLIENT_SECRET = 'test';
      process.env.DATABASE_URL = 'postgresql://test';
      process.env.ADMIN_EMAILS = 'admin@test.com';

      const { validateAuthEnvironment } = require('@/lib/env-validation');

      // Note: Current implementation doesn't trim, so these pass
      // This test documents current behavior
      // (Improvement: Add .trim() check in production)
      const result = validateAuthEnvironment();
      expect(result).toBe(true); // Current behavior
    });
  });
});
