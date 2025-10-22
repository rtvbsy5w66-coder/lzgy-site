# Kód Minőség és Best Practices Javaslatok
## Lovas Politikai Oldal - Részletes Kód Review

---

## 📚 Tartalomjegyzék

1. [TypeScript Best Practices](#typescript-best-practices)
2. [Biztonsági Minták Javítása](#biztonsági-minták-javítása)
3. [Kód Átláthatóság](#kód-átláthatóság)
4. [Performance Optimalizáció](#performance-optimalizáció)
5. [Karbantarthatóság](#karbantarthatóság)
6. [Tesztelési Best Practices](#tesztelési-best-practices)

---

## 1. TypeScript Best Practices

### ✅ Jelenlegi Erősségek

```typescript
// ✅ JÓ: Strict type definitions
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// ✅ JÓ: Const assertions
export const RATE_LIMITS = {
  API_DEFAULT: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
} as const;

// ✅ JÓ: Type guards használat
if (error instanceof BusinessLogicError) {
  return NextResponse.json(
    { success: false, error: error.message },
    { status: error.statusCode }
  );
}
```

### 🔧 Javítási Javaslatok

#### 1.1 Kerülje az `any` Típust

**Jelenlegi:**
```typescript
// ❌ ROSSZ: any típus tesztekben
let mockRequest: any;
```

**Javítás:**
```typescript
// ✅ JÓ: Explicit mock type
import { NextRequest } from 'next/server';
import { createMockNextRequest } from '../utils/next-test-helpers';

let mockRequest: ReturnType<typeof createMockNextRequest>;
```

#### 1.2 Discriminated Unions

**Javaslat:**
```typescript
// error-handler.ts javítása
type ApiError =
  | { success: false; error: string; code: string }
  | { success: true; data: unknown };

// Type-safe error handling
function handleApiError(error: unknown): ApiError {
  if (error instanceof BusinessLogicError) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
  // ...
}
```

#### 1.3 Generikus Rate Limiter

**Jelenlegi:**
```typescript
// Duplikált kód több rate limiter-ben
const ipRequests = new Map<string, { count: number; timestamp: number }>();
```

**Javítás:**
```typescript
// Generikus rate limiter típus
interface RateLimitEntry {
  count: number;
  timestamp: number;
  resetTime: number;
}

class RateLimitStore<K = string> {
  private store = new Map<K, RateLimitEntry>();

  get(key: K): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: K, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: K): void {
    this.store.delete(key);
  }

  cleanup(windowMs: number): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Használat
const ipRateLimit = new RateLimitStore<string>();
const userRateLimit = new RateLimitStore<number>(); // User ID alapú
```

---

## 2. Biztonsági Minták Javítása

### 2.1 Rate Limiter Unifikálás

**Probléma:** 3 különböző implementáció

**Megoldás: Adapter Pattern**

```typescript
// src/lib/rate-limiting/types.ts
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimiter {
  limit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult>;
}

// src/lib/rate-limiting/in-memory.ts (fejlesztés)
export class InMemoryRateLimiter implements RateLimiter {
  async limit(identifier: string, config: RateLimitConfig) {
    // Jelenlegi rate-limit-simple.ts logika
  }
}

// src/lib/rate-limiting/upstash.ts (production)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export class UpstashRateLimiter implements RateLimiter {
  private ratelimit: Ratelimit;

  constructor() {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '15 m'),
      analytics: true,
    });
  }

  async limit(identifier: string, config: RateLimitConfig) {
    const result = await this.ratelimit.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }
}

// src/lib/rate-limiting/index.ts
export const rateLimiter: RateLimiter =
  process.env.NODE_ENV === 'production'
    ? new UpstashRateLimiter()
    : new InMemoryRateLimiter();

// Minden rate limit ezt használja
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  return rateLimiter.limit(identifier, config);
}
```

**Előnyök:**
- ✅ DRY principle
- ✅ Környezetfüggő implementáció
- ✅ Könnyű tesztelhetőség
- ✅ Production-ready

### 2.2 CSRF Token Generation Javítás

**Javaslat: crypto.randomBytes használat**

```typescript
// csrf-protection.ts javítása
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  // ✅ Kriptográfiailag biztonságos
  return randomBytes(32).toString('base64url');
}

// Session-ba mentés cookie helyett (biztonságosabb)
export async function setCSRFToken(
  session: Session
): Promise<string> {
  const token = generateCSRFToken();

  // Session-ban tárolás (nem cookie-ban)
  session.csrfToken = token;
  await session.save();

  return token;
}
```

### 2.3 Password Policy Enforcement

**Javaslat: Erősebb jelszó követelmények**

```typescript
// src/lib/password-policy.ts (ÚJ FÁJL)
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

const DEFAULT_POLICY: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

export class PasswordPolicyError extends Error {
  constructor(
    message: string,
    public violations: string[]
  ) {
    super(message);
    this.name = 'PasswordPolicyError';
  }
}

export function validatePassword(
  password: string,
  policy: PasswordRequirements = DEFAULT_POLICY
): void {
  const violations: string[] = [];

  if (password.length < policy.minLength) {
    violations.push(
      `A jelszónak legalább ${policy.minLength} karakter hosszúnak kell lennie`
    );
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    violations.push('A jelszónak tartalmaznia kell nagy betűt');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    violations.push('A jelszónak tartalmaznia kell kis betűt');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    violations.push('A jelszónak tartalmaznia kell számot');
  }

  if (
    policy.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    violations.push('A jelszónak tartalmaznia kell speciális karaktert');
  }

  // Gyakori jelszavak ellenőrzése
  const commonPasswords = [
    'password',
    'Password123!',
    'Admin123!',
    'Qwerty123!',
  ];
  if (commonPasswords.includes(password)) {
    violations.push('Ez a jelszó túl gyakori, válasszon másikat');
  }

  if (violations.length > 0) {
    throw new PasswordPolicyError(
      'A jelszó nem felel meg a biztonsági követelményeknek',
      violations
    );
  }
}

// Használat auth.ts-ben
import { validatePassword } from './password-policy';

async function registerUser(email: string, password: string) {
  try {
    validatePassword(password);
    // Hash and save
  } catch (error) {
    if (error instanceof PasswordPolicyError) {
      return {
        success: false,
        error: error.message,
        violations: error.violations,
      };
    }
    throw error;
  }
}
```

---

## 3. Kód Átláthatóság

### 3.1 Magic Numbers Elimination

**Jelenlegi:**
```typescript
// ❌ ROSSZ: Magic numbers
const resetAt = now + 60000;
const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
```

**Javítás:**
```typescript
// ✅ JÓ: Named constants
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const DEFAULT_WINDOW_MS = 60 * MS_PER_MINUTE;

const resetAt = now + DEFAULT_WINDOW_MS;
const retryAfter = Math.ceil((resetTime - Date.now()) / MS_PER_SECOND);
```

### 3.2 Függvény Kis Mérete

**Jelenlegi:**
```typescript
// error-handler.ts handleApiError() - 100+ sor
export function handleApiError(error: unknown, context: string) {
  // Sok if-else ág
}
```

**Javítás: Strategy Pattern**
```typescript
// src/lib/error-handlers/index.ts
type ErrorHandler = (error: unknown, context: string) => NextResponse | null;

const errorHandlers: ErrorHandler[] = [
  handlePrismaError,
  handleBusinessLogicError,
  handleAuthError,
  handleValidationError,
  handleGenericError,
];

export function handleApiError(
  error: unknown,
  context: string
): NextResponse {
  console.error(`[${context}]`, error);

  for (const handler of errorHandlers) {
    const response = handler(error, context);
    if (response) return response;
  }

  // Fallback
  return NextResponse.json(
    { success: false, error: 'Ismeretlen hiba történt' },
    { status: 500 }
  );
}

// src/lib/error-handlers/prisma.ts
export function handlePrismaError(
  error: unknown,
  context: string
): NextResponse | null {
  if (!isPrismaError(error)) return null;

  const handlers = {
    P2002: handleUniqueConstraintViolation,
    P2025: handleRecordNotFound,
    P2003: handleForeignKeyViolation,
    P2014: handleInvalidRelation,
  };

  const handler = handlers[error.code];
  if (handler) return handler(error, context);

  return null;
}

function handleUniqueConstraintViolation(
  error: PrismaError,
  context: string
): NextResponse {
  const field = error.meta?.target?.[0] || 'mező';
  return NextResponse.json(
    {
      success: false,
      error: `Ez a ${field} már létezik`,
      code: 'DUPLICATE_ENTRY',
    },
    { status: 409 }
  );
}
```

**Előnyök:**
- ✅ Single Responsibility Principle
- ✅ Könnyebb tesztelhetőség
- ✅ Jobb átláthatóság
- ✅ Könnyebb bővíthetőség

### 3.3 Dokumentáció JSDoc-kal

**Javaslat:**
```typescript
/**
 * Ellenőrzi a rate limit-et a megadott identifier és konfiguráció alapján.
 *
 * @param identifier - Egyedi azonosító (pl. IP cím, user ID)
 * @param config - Rate limit konfiguráció (ablak méret, max kérések)
 * @returns Rate limit eredmény (siker, remaining, reset idő)
 *
 * @example
 * ```typescript
 * const result = await rateLimit('192.168.1.1', {
 *   windowMs: 60000,
 *   maxRequests: 10
 * });
 *
 * if (!result.success) {
 *   console.log(`Retry after ${result.reset}ms`);
 * }
 * ```
 *
 * @throws {RateLimitError} Ha a rate limit konfiguráció érvénytelen
 *
 * @see {@link RateLimitConfig} - Konfiguráció típus definíció
 * @see {@link RateLimitResult} - Visszatérési érték típus
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // ...
}
```

---

## 4. Performance Optimalizáció

### 4.1 Rate Limiter Cleanup Optimalizáció

**Jelenlegi:**
```typescript
// Minden 60 másodpercben fut cleanup
this.cleanupInterval = setInterval(() => {
  this.cleanup();
}, 60 * 1000);

private cleanup() {
  const now = Date.now();
  for (const [key, entry] of this.store.entries()) {
    if (entry.resetAt < now) {
      this.store.delete(key);
    }
  }
}
```

**Probléma:** O(n) komplexitás, minden 60 másodpercben

**Javítás: Lazy Cleanup**
```typescript
// Cleanup csak akkor, amikor hozzáférünk egy bejegyzéshez
async limit(identifier: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const entry = this.store.get(identifier);

  // Lazy cleanup - csak ezt az entry-t ellenőrizzük
  if (entry && entry.resetAt < now) {
    this.store.delete(identifier);
    return this.createNewEntry(identifier, maxRequests, windowMs);
  }

  // ... rest of logic
}

// Háttér cleanup ritkábban, de batch-elve
private scheduleBatchCleanup() {
  setInterval(() => {
    this.batchCleanup();
  }, 5 * 60 * 1000); // 5 percenként
}

private batchCleanup() {
  const now = Date.now();
  const keysToDelete: string[] = [];

  // Collect keys to delete
  for (const [key, entry] of this.store.entries()) {
    if (entry.resetAt < now) {
      keysToDelete.push(key);
    }
  }

  // Batch delete (ne blokkoljuk a main thread-et)
  const BATCH_SIZE = 100;
  for (let i = 0; i < keysToDelete.length; i += BATCH_SIZE) {
    const batch = keysToDelete.slice(i, i + BATCH_SIZE);
    batch.forEach(key => this.store.delete(key));
  }

  console.log(`[RateLimiter] Cleaned up ${keysToDelete.length} expired entries`);
}
```

### 4.2 Email Validation Caching

**Jelenlegi:**
```typescript
// Minden híváskor új regex compile
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Érvénytelen email cím');
  }
}
```

**Javítás:**
```typescript
// Regex pre-compile
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254; // RFC 5321

export function validateEmail(email: string): void {
  // Gyors ellenőrzések először
  if (!email || email.length > EMAIL_MAX_LENGTH) {
    throw new Error('Érvénytelen email cím');
  }

  // Regex utolsónak (lassabb)
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Érvénytelen email cím');
  }
}
```

### 4.3 Prisma Query Optimization

**Javaslat:**
```typescript
// ❌ ROSSZ: N+1 query probléma
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  });
}

// ✅ JÓ: Include használat
const users = await prisma.user.findMany({
  include: {
    posts: true
  }
});

// ✅ JÓ: Select csak szükséges mezők
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    // Ne kérjük le a jelszó hash-t ha nem kell
  }
});
```

---

## 5. Karbantarthatóság

### 5.1 Error Code Konstansok

**Javaslat:**
```typescript
// src/lib/error-codes.ts (ÚJ FÁJL)
export const ErrorCodes = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_SESSION_EXPIRED: 'AUTH_002',
  AUTH_UNAUTHORIZED: 'AUTH_003',
  AUTH_FORBIDDEN: 'AUTH_004',
  AUTH_TOKEN_INVALID: 'AUTH_005',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_001',

  // Validation
  VALIDATION_INVALID_EMAIL: 'VAL_001',
  VALIDATION_INVALID_DATE: 'VAL_002',
  VALIDATION_REQUIRED_FIELD: 'VAL_003',

  // Database
  DB_DUPLICATE_ENTRY: 'DB_001',
  DB_NOT_FOUND: 'DB_002',
  DB_FOREIGN_KEY_VIOLATION: 'DB_003',
  DB_INVALID_RELATION: 'DB_004',

  // Business Logic
  BL_EVENT_DATE_INVALID: 'BL_001',
  BL_PETITION_CLOSED: 'BL_002',

  // Generic
  INTERNAL_SERVER_ERROR: 'SYS_001',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Használat
import { ErrorCodes } from './error-codes';

throw new BusinessLogicError(
  'Az esemény kezdő dátuma nem lehet a múltban',
  ErrorCodes.BL_EVENT_DATE_INVALID,
  400
);

// Frontend error handling
if (error.code === ErrorCodes.AUTH_SESSION_EXPIRED) {
  redirectToLogin();
}
```

**Előnyök:**
- ✅ Központi error code management
- ✅ Type-safe error handling
- ✅ Könnyű frontend integráció
- ✅ Jobb monitoring/analytics

### 5.2 Environment Variables Validáció

**Javaslat:**
```typescript
// src/lib/env.ts (ÚJ FÁJL)
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Rate Limiting (Production)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // App
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();

// Használat
import { env } from '@/lib/env';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL!, // Type-safe
  token: env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### 5.3 Feature Flags

**Javaslat:**
```typescript
// src/lib/feature-flags.ts (ÚJ FÁJL)
export const FeatureFlags = {
  // Security
  ENABLE_CSRF_PROTECTION: process.env.ENABLE_CSRF === 'true',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false', // Default true
  ENABLE_2FA: process.env.ENABLE_2FA === 'true',

  // Features
  ENABLE_NEWSLETTER: process.env.ENABLE_NEWSLETTER !== 'false',
  ENABLE_PETITIONS: process.env.ENABLE_PETITIONS !== 'false',
  ENABLE_POLLS: process.env.ENABLE_POLLS !== 'false',

  // Rate Limiter Type
  USE_REDIS_RATE_LIMITER: process.env.NODE_ENV === 'production',
} as const;

// Használat
import { FeatureFlags } from '@/lib/feature-flags';

export const SECURITY_CONFIGS = {
  LOGIN: {
    rateLimit: 'LOGIN' as const,
    requireCSRF: FeatureFlags.ENABLE_CSRF_PROTECTION,
  }
};
```

---

## 6. Tesztelési Best Practices

### 6.1 Test Naming Convention

**Jelenlegi:** Jó (`EXECUTES:`, `SECURITY:` prefix)

**Továbbfejlesztés:**
```typescript
describe('rateLimit() - Core Functionality', () => {
  describe('GIVEN a new IP address', () => {
    describe('WHEN making first request', () => {
      it('THEN should allow request and set count to 1', async () => {
        // Arrange
        const ip = 'new-ip';
        const config = { max: 5, window: 60000 };

        // Act
        const result = await rateLimit(ip, config);

        // Assert
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4);
      });
    });
  });

  describe('GIVEN an IP that exceeded rate limit', () => {
    describe('WHEN window has expired', () => {
      it('THEN should reset counter and allow request', async () => {
        // Given-When-Then pattern
      });
    });
  });
});
```

### 6.2 Test Helpers Centralizálás

**Javaslat:**
```typescript
// test/helpers/security.ts (ÚJ FÁJL)
export class RateLimitTestHelper {
  async fillRateLimit(
    ip: string,
    config: { max: number; window: number }
  ): Promise<void> {
    for (let i = 0; i < config.max; i++) {
      await rateLimit(ip, config);
    }
  }

  async expectRateLimited(
    ip: string,
    config: { max: number; window: number }
  ): Promise<void> {
    const result = await rateLimit(ip, config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  }

  async expectAllowed(
    ip: string,
    config: { max: number; window: number }
  ): Promise<void> {
    const result = await rateLimit(ip, config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  }
}

// Használat tesztekben
import { RateLimitTestHelper } from '../helpers/security';

describe('Rate Limiting', () => {
  const helper = new RateLimitTestHelper();

  it('should block after exceeding limit', async () => {
    const config = { max: 3, window: 60000 };

    await helper.fillRateLimit('test-ip', config);
    await helper.expectRateLimited('test-ip', config);
  });
});
```

### 6.3 Integration Test Coverage

**Javaslat:**
```typescript
// test/integration/security-flow.test.ts (ÚJ FÁJL)
describe('Security Flow Integration Tests', () => {
  it('INTEGRATION: Full login flow with rate limiting', async () => {
    const ip = '192.168.1.100';

    // 1. Rate limit check
    const rateLimitResult = await checkRateLimit(ip, RATE_LIMITS.LOGIN);
    expect(rateLimitResult).toBe(true);

    // 2. CSRF validation
    const csrfToken = generateCSRFToken();
    const isValid = validateCSRFToken(csrfToken);
    expect(isValid).toBe(true);

    // 3. Authentication
    const authResult = await authenticate('user@example.com', 'password');
    expect(authResult.success).toBe(true);

    // 4. Session creation
    const session = await createSession(authResult.user);
    expect(session).toBeDefined();
  });

  it('INTEGRATION: Brute force attack scenario', async () => {
    const ip = 'attacker-ip';
    const attempts = 10;

    for (let i = 0; i < attempts; i++) {
      const result = await attemptLogin(ip, 'wrong-password');

      if (i < 5) {
        expect(result.rateLimited).toBe(false);
      } else {
        expect(result.rateLimited).toBe(true);
        expect(result.statusCode).toBe(429);
      }
    }
  });
});
```

---

## 📊 Prioritási Mátrix

| Javaslat | Prioritás | Becsült Idő | Hatás |
|----------|-----------|--------------|-------|
| Rate Limiter Unifikálás | 🔴 Magas | 3-4 óra | Karbantarthatóság++ |
| Upstash Redis Integráció | 🔴 Magas | 1-2 óra | Production Readiness |
| Password Policy | 🟡 Közepes | 2-3 óra | Biztonság+ |
| Error Code Konstansok | 🟡 Közepes | 1-2 óra | Karbantarthatóság+ |
| Environment Validáció | 🟡 Közepes | 1 óra | Reliability+ |
| TypeScript Strict | 🟢 Alacsony | 2-3 óra | Type Safety+ |
| JSDoc Dokumentáció | 🟢 Alacsony | 4-6 óra | Developer Experience+ |
| Performance Optimalizáció | 🟢 Alacsony | 2-3 óra | Performance+ |

---

## 🎯 Összefoglaló: Top 5 Ajánlás

### 1. **Rate Limiter Konszolidáció** (Magas Prioritás)
- Egy központi implementáció
- Adapter pattern dev/prod környezetekhez
- Teljes backward compatibility

### 2. **Upstash Redis Production Setup** (Magas Prioritás)
- Skálázható rate limiting
- Load balancer friendly
- Vercel integráció

### 3. **Password Policy Enforcement** (Közepes Prioritás)
- 12+ karakter
- Complexity követelmények
- Common password check

### 4. **Error Code Standardization** (Közepes Prioritás)
- Központi error code registry
- Type-safe error handling
- Frontend integration support

### 5. **Environment Variable Validation** (Közepes Prioritás)
- Runtime validation Zod-dal
- Type-safe environment access
- Startup failure on misconfiguration

---

**Elkészítve:** 2025. Október 21.
**Következő Review:** Implementáció után

