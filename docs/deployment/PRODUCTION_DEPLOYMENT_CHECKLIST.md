# Production Deployment Checklist
## Lovas Politikai Oldal - Üzembe Helyezési Útmutató

**Utolsó frissítés:** 2025. Október 21.
**Becsült teljes idő:** 8-12 óra (1-2 munkanap)

---

## 📋 Összefoglaló

| Prioritás | Feladat | Idő | Kritikus? |
|-----------|---------|-----|-----------|
| 🔴 P1 | Upstash Redis rate limiter | 1-2 óra | ✅ Igen |
| 🔴 P1 | CSRF védelem aktiválás | 2-3 óra | ✅ Igen |
| 🔴 P1 | Security headers audit | 1-2 óra | ✅ Igen |
| 🟡 P2 | Environment validation | 1 óra | ⚠️ Ajánlott |
| 🟡 P2 | Pre-commit hooks | 30 perc | ⚠️ Ajánlott |
| 🟡 P2 | Error tracking (Sentry) | 1-2 óra | ⚠️ Ajánlott |
| 🟢 P3 | Smoke test & monitoring | 1-2 óra | ℹ️ Opcionális |

---

## 🔴 PRIORITÁS 1: KRITIKUS (Deployment előtt KÖTELEZŐ)

### 1.1 Upstash Redis Rate Limiter Setup

**Miért fontos:**
- In-memory rate limiter **NEM SKÁLÁZÓDIK** több szerver esetén
- Load balancer mögött az IP-k elvesznek
- Production környezetben **KRITIKUS** a Redis-alapú megoldás

**Lépések:**

#### 1. Upstash Account Setup

```bash
# 1. Regisztráció: https://upstash.com/
# 2. Vercel Integration: https://vercel.com/integrations/upstash

# 3. Environment variables hozzáadása
# Vercel Dashboard → Settings → Environment Variables
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

#### 2. Dependencies telepítése

```bash
npm install @upstash/redis @upstash/ratelimit
```

#### 3. Production rate limiter implementáció

```typescript
// src/lib/rate-limiting/upstash.ts (ÚJ FÁJL)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiters = {
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:login',
  }),

  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '15 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  petition: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:petition',
  }),
};

// Wrapper function for compatibility
export async function rateLimit(
  identifier: string,
  type: keyof typeof rateLimiters
) {
  const limiter = rateLimiters[type];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
```

#### 4. Migráció a régi rate limiterről

```typescript
// src/lib/rate-limiting/index.ts (MÓDOSÍTÁS)
import { rateLimit as upstashRateLimit } from './upstash';
import { rateLimit as inMemoryRateLimit } from './in-memory';

// Environment-based selection
export const rateLimit =
  process.env.NODE_ENV === 'production' &&
  process.env.UPSTASH_REDIS_REST_URL
    ? upstashRateLimit
    : inMemoryRateLimit;
```

#### 5. Tesztelés

```bash
# Local tesztelés (in-memory)
npm run dev

# Production preview (Upstash)
UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... npm run build
npm start

# Load test
npx autocannon -c 100 -d 10 http://localhost:3000/api/test
```

**Sikerkritérium:**
- ✅ Upstash Dashboard-ban látható a rate limit analytics
- ✅ Load test alatt konzisztens rate limiting
- ✅ Nincs 500-as hiba production preview-ban

**Becsült idő:** 1-2 óra

---

### 1.2 CSRF Védelem Aktiválás

**Miért fontos:**
- Jelenleg **KIKAPCSOLT** több endpoint-on (LOGIN, PETITION_SIGN)
- **OWASP A01** kritikus sebezhetőség
- Kötelező politikai oldalaknál (adatkezelés)

**Lépések:**

#### 1. CSRF Token Generation Backend

```typescript
// src/lib/csrf-protection.ts (MÓDOSÍTÁS)
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function setCSRFToken(
  session: Session
): Promise<string> {
  const token = generateCSRFToken();

  // Session-ban tárolás (biztonságosabb mint cookie)
  session.csrfToken = token;
  session.csrfCreatedAt = Date.now();
  await session.save();

  return token;
}

export function validateCSRFToken(
  session: Session,
  token: string
): { valid: boolean; error?: Response } {
  // Token létezés ellenőrzés
  if (!session.csrfToken) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({ error: 'CSRF token hiányzik' }),
        { status: 403 }
      ),
    };
  }

  // Token egyezés
  if (session.csrfToken !== token) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({ error: 'Érvénytelen CSRF token' }),
        { status: 403 }
      ),
    };
  }

  // Token lejárat (1 óra)
  const TOKEN_LIFETIME = 60 * 60 * 1000;
  if (Date.now() - session.csrfCreatedAt > TOKEN_LIFETIME) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({ error: 'CSRF token lejárt' }),
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}
```

#### 2. Frontend CSRF Implementáció

```typescript
// src/app/api/csrf-token/route.ts (ÚJ ENDPOINT)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { setCSRFToken } from '@/lib/csrf-protection';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Nincs aktív session' },
      { status: 401 }
    );
  }

  const csrfToken = await setCSRFToken(session);

  return NextResponse.json({ csrfToken });
}
```

```typescript
// src/hooks/useCSRF.ts (ÚJ HOOK)
import { useEffect, useState } from 'react';

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string>('');

  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCSRFToken(data.csrfToken))
      .catch(console.error);
  }, []);

  return csrfToken;
}
```

```tsx
// Frontend form példa
import { useCSRF } from '@/hooks/useCSRF';

export function LoginForm() {
  const csrfToken = useCSRF();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken, // CSRF token header
      },
      body: JSON.stringify({ email, password }),
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### 3. Backend CSRF Ellenőrzés Aktiválás

```typescript
// src/lib/security-middleware.ts (MÓDOSÍTÁS)
export const SECURITY_CONFIGS = {
  LOGIN: {
    rateLimit: 'LOGIN' as const,
    requireCSRF: true, // ← VÁLTOZÁS: false → true
  },

  PETITION_SIGN: {
    rateLimit: 'PETITION_SIGN' as const,
    requireCSRF: true, // ← VÁLTOZÁS: false → true
  },
};
```

#### 4. Tesztelés

```bash
# Unit tesztek
npm test -- csrf

# Integration teszt
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
# Várt eredmény: 403 Forbidden (nincs CSRF token)

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: INVALID" \
  -d '{"email":"test@example.com","password":"test"}'
# Várt eredmény: 403 Forbidden (érvénytelen token)
```

**Sikerkritérium:**
- ✅ Minden POST endpoint CSRF-et ellenőriz
- ✅ Frontend automatikusan küld CSRF tokent
- ✅ Hibás token esetén 403 Forbidden

**Becsült idő:** 2-3 óra

---

### 1.3 Security Headers Audit és Finalizálás

**Miért fontos:**
- **OWASP A05:** Security Misconfiguration
- Mozilla Observatory és SecurityHeaders.io teszt szükséges
- Böngésző szintű biztonság

**Lépések:**

#### 1. Jelenlegi Headers Audit

```bash
# Online eszközök:
# 1. https://securityheaders.com/?q=your-domain.com
# 2. https://observatory.mozilla.org/analyze/your-domain.com

# Local teszt
curl -I http://localhost:3000 | grep -E "(X-|Content-Security|Strict-Transport)"
```

#### 2. Next.js Middleware Headers Konfiguráció

```typescript
// src/middleware.ts (MÓDOSÍTÁS)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://vercel.live wss://ws-*.pusher.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // 2. X-Frame-Options (clickjacking védelem)
  response.headers.set('X-Frame-Options', 'DENY');

  // 3. X-Content-Type-Options (MIME sniffing védelem)
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 4. Referrer-Policy
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );

  // 5. Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // 6. Strict-Transport-Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // 7. X-XSS-Protection (legacy)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### 3. next.config.js Headers

```javascript
// next.config.js (MÓDOSÍTÁS)
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### 4. Tesztelés

```bash
# SecurityHeaders.com teszt
curl -I https://your-preview-url.vercel.app

# Mozilla Observatory teszt
# https://observatory.mozilla.org/

# Helyi teszt
npm run build
npm start
curl -I http://localhost:3000 | grep -E "X-|Content-Security|Strict"
```

**Sikerkritérium:**
- ✅ SecurityHeaders.com: **A vagy A+** osztályzat
- ✅ Mozilla Observatory: **B+ vagy magasabb**
- ✅ Minden header jelen van production-ben

**Becsült idő:** 1-2 óra

---

## 🟡 PRIORITÁS 2: AJÁNLOTT (Deployment előtt ERŐSEN AJÁNLOTT)

### 2.1 Environment Variables Validáció (Zod)

**Miért fontos:**
- Runtime hiba elkerülése hiányzó env változók miatt
- Type-safe environment access
- Fejlesztői hibák kiszűrése build időben

**Implementáció:**

```bash
npm install zod
```

```typescript
// src/lib/env.ts (ÚJ FÁJL)
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Upstash Redis (Production)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_').optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export const env = validateEnv();
```

```typescript
// Használat
import { env } from '@/lib/env';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL, // Type-safe!
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
```

**Sikerkritérium:**
- ✅ `npm run build` sikertelen hiányzó env változók esetén
- ✅ Minden env változó type-safe

**Becsült idő:** 1 óra

---

### 2.2 Pre-commit Hooks Setup

**Miért fontos:**
- Konzisztens kód formázás
- Lint hibák kiszűrése commit előtt
- Type check automatizálás

**Implementáció:**

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json (MÓDOSÍTÁS)
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit (ÚJ FÁJL)
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

**Sikerkritérium:**
- ✅ Hibás kód commit-olás meghiúsul
- ✅ Automatikus formázás minden commit előtt

**Becsült idő:** 30 perc

---

### 2.3 Error Tracking Integráció (Sentry)

**Miért fontos:**
- Production hibák azonnali detektálása
- Stack trace és user context
- Performance monitoring

**Implementáció:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts (GENERÁLT)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Error filtering
  beforeSend(event, hint) {
    // Szűrés: ne küldjön minden hibát
    if (event.exception) {
      const error = hint.originalException;

      // Rate limit hibák kiszűrése (túl sok lenne)
      if (error?.message?.includes('Rate limit')) {
        return null;
      }
    }

    return event;
  },
});
```

```typescript
// src/lib/error-handler.ts (MÓDOSÍTÁS)
import * as Sentry from '@sentry/nextjs';

export function handleApiError(error: unknown, context: string) {
  // Sentry logging
  Sentry.captureException(error, {
    tags: { context },
    level: 'error',
  });

  // Eredeti logika...
  console.error(`[${context}]`, error);
  // ...
}
```

**Sikerkritérium:**
- ✅ Hibák megjelennek Sentry dashboard-on
- ✅ Source maps feltöltve
- ✅ User context tracking

**Becsült idő:** 1-2 óra

---

## 🟢 PRIORITÁS 3: OPCIONÁLIS (De jó ha van)

### 3.1 Production Smoke Test

**Smoke Test Script:**

```typescript
// scripts/smoke-test.ts (ÚJ FÁJL)
import { expect } from '@jest/globals';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function smokeTest() {
  console.log('🔥 Running smoke tests...\n');

  // 1. Health check
  console.log('1. Health check...');
  const health = await fetch(`${BASE_URL}/api/health`);
  expect(health.status).toBe(200);
  console.log('   ✅ Health check passed');

  // 2. Rate limiting
  console.log('2. Rate limiting test...');
  const promises = Array.from({ length: 10 }, () =>
    fetch(`${BASE_URL}/api/test`)
  );
  const responses = await Promise.all(promises);
  const rateLimited = responses.some(r => r.status === 429);
  expect(rateLimited).toBe(true);
  console.log('   ✅ Rate limiting works');

  // 3. CSRF protection
  console.log('3. CSRF protection test...');
  const csrfTest = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test', password: 'test' }),
  });
  expect(csrfTest.status).toBe(403);
  console.log('   ✅ CSRF protection works');

  // 4. Security headers
  console.log('4. Security headers test...');
  const headers = await fetch(BASE_URL).then(r => r.headers);
  expect(headers.get('X-Frame-Options')).toBe('DENY');
  expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(headers.get('Content-Security-Policy')).toBeTruthy();
  console.log('   ✅ Security headers present');

  console.log('\n✅ All smoke tests passed!');
}

smokeTest().catch(err => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});
```

```bash
# Futtatás
npm run build
npm start
npx tsx scripts/smoke-test.ts
```

---

## 📊 Deployment Workflow

### Recommended Git Workflow:

```bash
# 1. Új branch a deployment taskokhoz
git checkout -b production-deployment

# 2. Implementáld a P1 taskok-at
# - Upstash Redis
# - CSRF
# - Security headers

git add .
git commit -m "feat: production deployment - P1 tasks complete"

# 3. Push to preview
git push origin production-deployment

# 4. Vercel Preview Deploy
# - Automatikus preview URL
# - Tesztelés preview URL-en

# 5. Smoke test futtatás
TEST_URL=https://your-preview.vercel.app npx tsx scripts/smoke-test.ts

# 6. SecurityHeaders.com teszt
# https://securityheaders.com/?q=your-preview.vercel.app

# 7. Ha minden OK → Production merge
git checkout main
git merge production-deployment
git push origin main

# 8. Production monitoring
# - Sentry dashboard figyelés
# - Vercel analytics
# - Rate limit analytics (Upstash)
```

---

## ✅ Végső Ellenőrző Lista

### Pre-Deployment Checklist:

- [ ] **Upstash Redis** működik preview-ban
- [ ] **CSRF védelem** aktív minden POST endpoint-on
- [ ] **Security headers** A vagy A+ SecurityHeaders.com-on
- [ ] **Environment variables** validálva (Zod)
- [ ] **Pre-commit hooks** működnek
- [ ] **Sentry** hibákat küld
- [ ] **Smoke tests** sikeresek preview-on
- [ ] **Load test** sikeres (100+ concurrent user)
- [ ] **Backup** terv létezik
- [ ] **Rollback** terv dokumentálva

### Post-Deployment Monitoring (Első 24 óra):

- [ ] Sentry dashboard figyelés (hibák)
- [ ] Vercel Analytics (performance)
- [ ] Upstash Analytics (rate limiting)
- [ ] Database connection pool monitoring
- [ ] Response time monitoring (<500ms average)

---

## 📞 Segítség és Támogatás

Ha bármelyik lépésnél problémába ütközöl:

1. **Dokumentáció:** Nézd meg a részletes audit jelentéseket
2. **Testing:** Minden változtatás után futtass teszteket
3. **Rollback:** Ha valami nem működik, használd a `git revert` parancsot

---

**Készítette:** AI Security Audit Team
**Utolsó frissítés:** 2025. Október 21.
**Státusz:** ✅ Production Ready

