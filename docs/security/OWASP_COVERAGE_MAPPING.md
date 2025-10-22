# OWASP Top 10 Lefedettség - Részletes Mapping

**Dátum**: 2025. október 17.
**OWASP Verzió**: Top 10 2021
**Projekt**: lovas-political-site

---

## OWASP Top 10 (2021) Kategóriák és Tesztelés

### A01:2021 – Broken Access Control

**Leírás**: Hibás hozzáférés-szabályozás, amikor a felhasználók más felhasználók adataihoz vagy admin funkciókhoz férhetnek hozzá.

**Védelmi Implementáció**:
- File: `/middleware.ts`
- Mechanizmus: JWT token + ADMIN role check
- Védett útvonalak: `/admin/*`, `/api/admin/*`

**Tesztelés**:

| Teszt Típus | Teszt Fájl | Konkrét Tesztek | Coverage |
|-------------|-----------|-----------------|----------|
| **Strukturális** | `middleware-auth.test.ts` | 22 teszt | 0% |
| | - should have middleware.ts in project root | Fájl létezés | - |
| | - should export middleware function | Export ellenőrzés | - |
| | - should import getToken from next-auth/jwt | Import ellenőrzés | - |
| | - should import User_role from Prisma | Import ellenőrzés | - |
| | - should check for ADMIN role | Kód tartalom | - |
| | - should redirect unauthorized users | Kód tartalom | - |
| | - should protect /admin routes | Kód tartalom | - |
| **Funkcionális** | ❌ NINCS | - | 0% |

**Státusz**: ⚠️ **STRUKTURÁLISAN VERIFIED, FUNKCIONÁLISAN NOT TESTED**

**Hiányzó Tesztek**:
```typescript
// PÉLDA - Hiányzó funkcionális teszt:
it('BLOCKS: Unauthenticated user from /admin', async () => {
  const req = new NextRequest('http://localhost:3000/admin');
  const response = await middleware(req);

  expect(response.status).toBe(307); // Redirect
  expect(response.headers.get('location')).toContain('/login');
});

it('BLOCKS: USER role from /admin (only ADMIN allowed)', async () => {
  mockGetToken.mockResolvedValue({ role: 'USER' });
  const req = new NextRequest('http://localhost:3000/admin');
  const response = await middleware(req);

  expect(response.status).toBe(307); // Redirect to unauthorized
});
```

---

### A02:2021 – Cryptographic Failures

**Leírás**: Titkosítási hibák, bizalmas adatok védelme (jelszavak, tokenek, stb.).

**Védelmi Implementáció**:
- NextAuth.js JWT tokenek
- NEXTAUTH_SECRET environment variable
- Secure cookies (production)
- Bcrypt password hashing

**Tesztelés**:

| Teszt Típus | Teszt Fájl | Konkrét Tesztek | Coverage |
|-------------|-----------|-----------------|----------|
| **Strukturális** | `middleware-auth.test.ts` | 3 teszt | 0% |
| | - should use NEXTAUTH_SECRET from environment | Environment var check | - |
| **Strukturális** | `documentation.test.ts` | 2 teszt | N/A |
| | - should have .env.example with security variables | File exists | - |
| | - should have .gitignore protecting sensitive files | File exists | - |
| **Git Audit** | Manual verification | Git history clean | N/A |
| | - .env.local never committed | git log verified | - |
| **Funkcionális** | ❌ NINCS | - | 0% |

**Státusz**: ⚠️ **STRUKTURÁLISAN VERIFIED, CONFIG VERIFIED, FUNKCIONÁLISAN NOT TESTED**

---

### A03:2021 – Injection

**Leírás**: SQL injection, XSS, command injection, stb.

**Védelmi Implementáció**:
- Zod input validation (MINDEN API input)
- Prisma ORM (prepared statements)
- Email sanitization
- HTML escaping (React automatic)

**Tesztelés**:

| Teszt Típus | Teszt Fájl | Konkrét Tesztek | Coverage |
|-------------|-----------|-----------------|----------|
| **Strukturális** | `input-validation.test.ts` | 34 teszt | 0% |
| | Schema létezés tesztek | 34 verschiedene schemas | - |
| **Funkcionális** | `zod-validation-functional.test.ts` | 29/32 teszt | ~50-70% |
| | **XSS Prevention**: | | |
| | - should reject invalid email formats | SQL injection pattern rejection | ✅ |
| | - SQL injection patterns rejected | "'; DROP TABLE--" típusú | ✅ |
| | **Email Injection**: | | |
| | - Invalid emails rejected | 6 különböző pattern | ✅ |
| | **Data Sanitization**: | | |
| | - Email normalization (lowercase) | JOHN@X.COM → john@x.com | ✅ |
| | - Whitespace trimming | "  input  " → "input" | ✅ |
| | - Phone number normalization | 06201234567 → +36201234567 | ✅ |
| | **Length Validation**: | | |
| | - Reject too-short name | 1 char rejected | ✅ |
| | - Reject too-long name | 101+ chars rejected | ✅ |
| | - Message length validation | <10 chars rejected | ✅ |

**Konkrét Védett Endpointok**:
1. `/api/newsletter/subscribe` - Zod validation + Prisma
2. `/api/contact` - Zod validation + Prisma
3. `/api/auth/request-code` - Email validation
4. `/api/issues/submit` - Zod validation

**Státusz**: ✅ **MOSTLY VERIFIED** (50-70% coverage)

**Bizonyíték - Működő Teszt Példa**:
```typescript
// VALÓS FUTÓ TESZT:
it('EXECUTES: SQL injection patterns rejected', () => {
  const injections = [
    "'; DROP TABLE users; --",
    "admin'--",
    "1' OR '1'='1",
  ];

  injections.forEach(injection => {
    const result = newsletterSubscribeSchema.safeParse({
      name: 'Attacker',
      email: injection,  // Invalid email format
      categories: ['EU'],
    });

    expect(result.success).toBe(false); // ✅ PASS - Injection blocked
  });
});
```

---

### A04:2021 – Insecure Design

**Leírás**: Biztonsági tervezési hibák, például rate limiting hiánya, brute force védelem hiánya.

**Védelmi Implementáció**:
- Rate limiting (sliding window)
- Brute force protection
- Input validation
- Secure defaults

**Tesztelés**:

| Teszt Típus | Teszt Fájl | Konkrét Tesztek | Coverage |
|-------------|-----------|-----------------|----------|
| **Strukturális** | `rate-limiting.test.ts` | 17 teszt | 0% |
| | Configuration checks | RATE_LIMITS object | - |
| **Funkcionális** | `rate-limit-functional.test.ts` | 13 teszt | **63.2%** ✅ |
| | **Rate Limit Enforcement**: | | |
| | - rateLimit() executes with valid identifier | Function runs | ✅ |
| | - Blocks after max requests | 3 req allowed, 4th blocked | ✅ |
| | - Reset timestamp calculation | Correct expiry time | ✅ |
| | - Multiple identifiers independently | user-a ≠ user-b | ✅ |
| | **Configuration Execution**: | | |
| | - AUTH_LOGIN configuration (5 req / 15 min) | Config works | ✅ |
| | - NEWSLETTER_SUBSCRIBE (3 req / 60 min) | Config works | ✅ |
| | - CONTACT_FORM (5 req / 60 min) | Config works | ✅ |
| | **Real-World Scenarios**: | | |
| | - Brute force attack simulation | 10 req → 3 success, 7 blocked | ✅ |
| | - Concurrent request handling | 8 concurrent → max 5 success | ✅ |

**Védett Endpointok**:
- `/api/auth/request-code` - 5 attempts / 15 min
- `/api/newsletter/subscribe` - 3 attempts / 60 min
- `/api/contact` - 5 attempts / 60 min

**Státusz**: ✅ **VERIFIED** (63.2% code coverage)

**Bizonyíték - Működő Teszt**:
```typescript
// VALÓS FUTÓ TESZT - Brute Force Protection:
it('EXECUTES: Brute force attack simulation', async () => {
  const attacker = 'brute-force-attacker';
  const config = { max: 3, window: 10000 };

  const attempts: boolean[] = [];

  // Simulate 10 rapid requests
  for (let i = 0; i < 10; i++) {
    const result = await rateLimit(attacker, config);
    attempts.push(result.success);
  }

  // First 3 succeed, rest fail ✅ VERIFIED
  expect(attempts.slice(0, 3).every(s => s === true)).toBe(true);
  expect(attempts.slice(3).every(s => s === false)).toBe(true);
});
```

**Coverage Adatok** (`rate-limit-simple.ts`):
- Statements: 24/38 executed (63.2%)
- Functions: 4/9 executed (44.4%)
- Branches: 5/9 executed (55.6%)

---

### A05:2021 – Security Misconfiguration

**Leírás**: Hibás biztonsági beállítások, debug mode production-ben, default jelszavak, stb.

**Védelmi Implementáció**:
- .env.local in .gitignore
- Secure environment variables
- NextAuth.js secure configuration
- CORS configuration

**Tesztelés**:

| Teszt Típus | Teszt Fájl | Konkrét Tesztek | Coverage |
|-------------|-----------|-----------------|----------|
| **Strukturális** | `documentation.test.ts` | 10 teszt | N/A |
| | - .gitignore protects sensitive files | .env.local excluded | ✅ |
| | - .env.example has security variables | Template exists | ✅ |
| | - NEXTAUTH_SECRET usage | Environment var | ✅ |
| **Git Audit** | Manual + `GIT_AUDIT_REPORT.md` | Full history scan | N/A |
| | - .env.local never in git | git log verified | ✅ |
| | - No secrets in commits | Clean history | ✅ |

**Státusz**: ✅ **VERIFIED**

---

### A06:2021 – Vulnerable and Outdated Components

**Leírás**: Elavult library-k, ismert sebezhetőségek.

**Védelmi Implementáció**:
- npm audit regular checks
- Dependency updates
- Lock files (package-lock.json)

**Tesztelés**:

| Teszt Típus | Teszt Fájl | Konkrét Tesztek | Coverage |
|-------------|-----------|-----------------|----------|
| **Manual Audit** | `npm audit` | npm vulnerabilities | Manual |
| | Current status | 7 vulnerabilities (1 low, 6 moderate) | ⚠️ |
| **Strukturális** | `documentation.test.ts` | 2 teszt | N/A |
| | - Required security packages installed | zod, @upstash/* | ✅ |

**Státusz**: ⚠️ **KNOWN ISSUES** (upstream dependencies)

**Sebezhetőségek**:
- next-auth: 1 moderate (függőségi probléma)
- react-quill: 5 moderate (upstream fix szükséges)
- cookie: 1 low (indirect dependency)

---

### A07:2021 – Identification and Authentication Failures

**Leírás**: Hiba a felhasználó azonosításban és autentikációban.

**Védelmi Implementáció**:
- NextAuth.js
- JWT tokens
- Email-based authentication
- Session management
- Rate limiting on auth endpoints

**Tesztelés**:

| Teszt Típus | Teszt Fájl | Konkrét Tesztek | Coverage |
|-------------|-----------|-----------------|----------|
| **Strukturális** | `middleware-auth.test.ts` | 8 teszt | 0% |
| | JWT configuration | getToken usage | - |
| | Token verification | Code structure | - |
| **Strukturális** | `rate-limiting.test.ts` | 3 teszt | 0% |
| | Auth endpoint rate limiting config | RATE_LIMITS.AUTH_LOGIN | - |
| **Funkcionális** | `rate-limit-functional.test.ts` | 1 teszt | 63.2% |
| | - AUTH_LOGIN execution | 5 req / 15 min enforced | ✅ |
| **Funkcionális** | ❌ NINCS (JWT tests) | - | 0% |

**Státusz**: ⚠️ **RATE LIMITING VERIFIED, JWT NOT TESTED**

**Védelem**:
- `/api/auth/request-code`: 5 kérés / 15 perc ✅ VERIFIED

---

### A08:2021 – Software and Data Integrity Failures

**Leírás**: Kód és adatintegritás (pl. CDN kompromittálás, unsigned updates).

**Védelmi Implementáció**:
- Package lock files
- Verified npm packages
- No external CDN dependencies

**Tesztelés**: ⚠️ **MINIMAL**

---

### A09:2021 – Security Logging and Monitoring Failures

**Leírás**: Hiányos logolás és monitoring.

**Védelmi Implementáció**:
- Console.log (basic)
- ⚠️ Nincs Pino structured logging
- ⚠️ Nincs Sentry error tracking

**Tesztelés**: ❌ **NOT IMPLEMENTED**

**Státusz**: ❌ **NEEDS WORK**

---

### A10:2021 – Server-Side Request Forgery (SSRF)

**Leírás**: Server-side request manipulation.

**Védelmi Implementáció**:
- Input validation
- No user-controlled URLs

**Tesztelés**: ✅ **BY DESIGN** (nem alkalmazható erre a projektre)

---

## Összesített OWASP Coverage

| OWASP Kategória | Védelem Implementálva | Strukturális Teszt | Funkcionális Teszt | Valós Coverage |
|-----------------|----------------------|-------------------|-------------------|----------------|
| A01: Broken Access Control | ✅ | ✅ 22 teszt | ❌ | 0% |
| A02: Cryptographic Failures | ✅ | ✅ 5 teszt | ❌ | 0% |
| A03: Injection | ✅ | ✅ 34 teszt | ✅ 29 teszt | ~50-70% |
| A04: Insecure Design | ✅ | ✅ 17 teszt | ✅ 13 teszt | 63.2% |
| A05: Security Misconfiguration | ✅ | ✅ 10 teszt | N/A | N/A |
| A06: Vulnerable Components | ⚠️ | Manual | Manual | N/A |
| A07: Auth Failures | ✅ | ✅ 11 teszt | ⚠️ Partial | ~30% |
| A08: Data Integrity | ⚠️ | Minimal | ❌ | 0% |
| A09: Logging/Monitoring | ❌ | ❌ | ❌ | 0% |
| A10: SSRF | N/A | N/A | N/A | N/A |

**Összesített Státusz**: ⚠️ **RÉSZLEGES LEFEDETTSÉG**

---

## Következtetések

### Jól Fedett Területek ✅:
1. **A04: Insecure Design** - Rate limiting 63% coverage
2. **A03: Injection** - Zod validation 50-70% coverage
3. **A05: Security Misconfiguration** - Git audit + config checks

### Gyengén Fedett Területek ⚠️:
1. **A01: Broken Access Control** - 0% functional coverage
2. **A07: Auth Failures** - JWT not functionally tested
3. **A09: Logging/Monitoring** - Not implemented

### Kritikus Hiányosságok ❌:
1. Middleware funkcionális tesztek
2. JWT token verification tesztek
3. Strukturált logolás és monitoring

---

**Dokumentum Készítve**: 2025. október 17.
**Következő Review**: Middleware tesztek után
