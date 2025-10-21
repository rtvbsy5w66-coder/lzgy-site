/**
 * OWASP A08:2021 - Software and Data Integrity Failures
 * CSRF Protection Functional Tests
 * Coverage Target: src/lib/csrf-protection.ts (96 lines) -> 100%
 */

import {
  generateCSRFToken,
  validateCSRFToken,
  requireCSRFToken,
} from '@/lib/csrf-protection';
import { createMockNextRequest, getResponseJson } from '../utils/next-test-helpers';

describe('OWASP A08: CSRF Protection', () => {
  describe('generateCSRFToken()', () => {
    it('EXECUTES: Generates valid token with 3 parts (timestamp:random:hash)', () => {
      const token = generateCSRFToken();
      const parts = token.split(':');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^\d+$/); // timestamp
      expect(parts[1]).toHaveLength(32); // random hex
      expect(parts[2]).toHaveLength(64); // SHA-256 hash
    });

    it('EXECUTES: Generated tokens are immediately valid', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token)).toBe(true);
    });

    it('EXECUTES: Generates unique tokens', () => {
      const tokens = [generateCSRFToken(), generateCSRFToken(), generateCSRFToken()];
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(3);
    });
  });

  describe('validateCSRFToken()', () => {
    it('EXECUTES: Validates fresh tokens', () => {
      expect(validateCSRFToken(generateCSRFToken())).toBe(true);
    });

    it('EXECUTES: Rejects null/undefined', () => {
      expect(validateCSRFToken(null as any)).toBe(false);
      expect(validateCSRFToken(undefined as any)).toBe(false);
      expect(validateCSRFToken('' as any)).toBe(false);
      expect(validateCSRFToken(123 as any)).toBe(false);
    });

    it('EXECUTES: Rejects wrong format (not 3 parts)', () => {
      expect(validateCSRFToken('only:two')).toBe(false);
      expect(validateCSRFToken('one:two:three:four')).toBe(false);
    });

    it('EXECUTES: Rejects tampered hash', () => {
      const token = generateCSRFToken();
      const [ts, rand, hash] = token.split(':');
      const tampered = `${ts}:${rand}:${hash.slice(0, -1)}X`;

      expect(validateCSRFToken(tampered)).toBe(false);
    });

    it('EXECUTES: Rejects tampered timestamp', () => {
      const token = generateCSRFToken();
      const [ts, rand, hash] = token.split(':');
      const tampered = `${parseInt(ts) + 1000}:${rand}:${hash}`;

      expect(validateCSRFToken(tampered)).toBe(false);
    });

    it('EXECUTES: Rejects expired token (>30 min old)', () => {
      const oldTimestamp = Date.now() - 31 * 60 * 1000;
      const token = generateCSRFToken();
      const [, rand, hash] = token.split(':');
      const expired = `${oldTimestamp}:${rand}:${hash}`;

      expect(validateCSRFToken(expired)).toBe(false);
    });
  });

  describe('requireCSRFToken() - Safe methods skip CSRF', () => {
    it('EXECUTES: Skips GET/HEAD/OPTIONS', () => {
      ['GET', 'HEAD', 'OPTIONS'].forEach(method => {
        const req = createMockNextRequest({ url: '/api/test', method });
        const result = requireCSRFToken(req);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('requireCSRFToken() - Unsafe methods require token', () => {
    it('EXECUTES: Requires token for POST/PUT/DELETE/PATCH', () => {
      ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
        const req = createMockNextRequest({ url: '/api/test', method });
        const result = requireCSRFToken(req);

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('EXECUTES: Returns 403 for missing token', () => {
      const req = createMockNextRequest({ url: '/api/test', method: 'POST' });
      const result = requireCSRFToken(req);

      expect(result.error?.status).toBe(403);
    });

    it('EXECUTES: Returns JSON error for missing token', async () => {
      const req = createMockNextRequest({ url: '/api/test', method: 'POST' });
      const result = requireCSRFToken(req);

      const json = await getResponseJson(result.error!);

      expect(json.code).toBe('CSRF_TOKEN_MISSING');
      expect(json.error).toBeDefined();
    });
  });

  describe('requireCSRFToken() - Token validation', () => {
    it('EXECUTES: Accepts valid token via x-csrf-token header', () => {
      const token = generateCSRFToken();
      const req = createMockNextRequest({
        url: '/api/test',
        method: 'POST',
        headers: { 'x-csrf-token': token }
      });

      const result = requireCSRFToken(req);
      expect(result.valid).toBe(true);
    });

    it('EXECUTES: Accepts valid token via csrf-token header', () => {
      const token = generateCSRFToken();
      const req = createMockNextRequest({
        url: '/api/test',
        method: 'POST',
        headers: { 'csrf-token': token }
      });

      const result = requireCSRFToken(req);
      expect(result.valid).toBe(true);
    });

    it('EXECUTES: Prefers x-csrf-token over csrf-token', () => {
      const validToken = generateCSRFToken();
      const req = createMockNextRequest({
        url: '/api/test',
        method: 'POST',
        headers: {
          'x-csrf-token': validToken,
          'csrf-token': 'invalid'
        }
      });

      expect(requireCSRFToken(req).valid).toBe(true);
    });

    it('EXECUTES: Rejects invalid token', () => {
      const req = createMockNextRequest({
        url: '/api/test',
        method: 'POST',
        headers: { 'x-csrf-token': 'invalid-token' }
      });

      const result = requireCSRFToken(req);
      expect(result.valid).toBe(false);
      expect(result.error?.status).toBe(403);
    });

    it('EXECUTES: Returns JSON error for invalid token', async () => {
      const req = createMockNextRequest({
        url: '/api/test',
        method: 'POST',
        headers: { 'x-csrf-token': 'bad' }
      });

      const result = requireCSRFToken(req);
      const json = await getResponseJson(result.error!);

      expect(json.code).toBe('CSRF_TOKEN_INVALID');
    });

    it('EXECUTES: Rejects expired token', () => {
      const oldTimestamp = Date.now() - 31 * 60 * 1000;
      const token = generateCSRFToken();
      const [, rand, hash] = token.split(':');
      const expired = `${oldTimestamp}:${rand}:${hash}`;

      const req = createMockNextRequest({
        url: '/api/test',
        method: 'POST',
        headers: { 'x-csrf-token': expired }
      });

      expect(requireCSRFToken(req).valid).toBe(false);
    });
  });

  describe('OWASP A08 Security Scenarios', () => {
    it('SECURITY: Prevents CSRF attack without token', () => {
      const req = createMockNextRequest({
        url: '/api/admin/delete',
        method: 'DELETE'
      });

      expect(requireCSRFToken(req).valid).toBe(false);
    });

    it('SECURITY: Prevents CSRF with tampered token', () => {
      const token = generateCSRFToken();
      const [ts, rand, hash] = token.split(':');
      const tampered = `${ts}:${rand}:${hash.slice(0, -2)}XX`;

      const req = createMockNextRequest({
        url: '/api/admin/settings',
        method: 'PUT',
        headers: { 'x-csrf-token': tampered }
      });

      expect(requireCSRFToken(req).valid).toBe(false);
    });

    it('SECURITY: Prevents replay of old token (1 hour)', () => {
      const oldTimestamp = Date.now() - 60 * 60 * 1000;
      const token = generateCSRFToken();
      const [, rand, hash] = token.split(':');
      const old = `${oldTimestamp}:${rand}:${hash}`;

      const req = createMockNextRequest({
        url: '/api/admin/users',
        method: 'DELETE',
        headers: { 'x-csrf-token': old }
      });

      expect(requireCSRFToken(req).valid).toBe(false);
    });

    it('SECURITY: Allows safe GET without token', () => {
      const req = createMockNextRequest({ url: '/api/users', method: 'GET' });
      expect(requireCSRFToken(req).valid).toBe(true);
    });
  });
});
