// src/lib/csrf-protection.ts
import { NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "default-csrf-secret-change-in-production";
const TOKEN_LENGTH = 32;

export function generateCSRFToken(): string {
  const timestamp = Date.now().toString();
  const random = randomBytes(16).toString('hex');
  const data = `${timestamp}:${random}`;
  
  const hash = createHash('sha256')
    .update(data + CSRF_SECRET)
    .digest('hex');
  
  return `${data}:${hash}`;
}

export function validateCSRFToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [timestamp, random, providedHash] = parts;
  const data = `${timestamp}:${random}`;
  
  // Verify hash
  const expectedHash = createHash('sha256')
    .update(data + CSRF_SECRET)
    .digest('hex');
  
  if (providedHash !== expectedHash) {
    return false;
  }

  // Check if token is not too old (30 minutes)
  const tokenTime = parseInt(timestamp);
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  if (now - tokenTime > maxAge) {
    return false;
  }

  return true;
}

export function requireCSRFToken(req: NextRequest): { valid: boolean; error?: Response } {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return { valid: true };
  }

  const token = req.headers.get('x-csrf-token') || 
                req.headers.get('csrf-token');

  if (!token) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({
          error: "CSRF token hiányzik",
          code: "CSRF_TOKEN_MISSING"
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }

  if (!validateCSRFToken(token)) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({
          error: "Érvénytelen CSRF token",
          code: "CSRF_TOKEN_INVALID"
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }

  return { valid: true };
}