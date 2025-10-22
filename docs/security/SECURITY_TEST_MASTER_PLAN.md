# Security Test Implementation - Master Plan
**Dátum:** 2025-10-18
**Cél:** Professzionális, magas szintű, 80%+ coverage biztonsági teszt infrastruktúra

---

## Jelenlegi Helyzet

### ✅ Sikerek
1. **Validáció tesztek**: 100% coverage elérve
   - `src/lib/validations/common.ts`: 100%
   - `src/lib/validations/newsletter.ts`: 100%
   - Valódi Zod execution működik

2. **Rate limiting tesztek**: 76% coverage elérve
   - `src/lib/rate-limit-simple.ts`: 76.31% stmt, 88.88% branch
   - Valódi limitálás tesztelve

### ⚠️ Javítandó
1. **Middleware tesztek**: NextRequest mock hiba
2. **Rate-limit tesztek**: 2 hiba (Response headers)
3. **Validation tesztek**: 1 hiba (error path)

### ❌ Hiányzik
1. Newsletter flow E2E tesztek
2. OWASP compliance mapping dokumentáció
3. Teljes lefedettségi riport

---

## Fázisok Részletesen

### Phase 1: Functional Test Fixes (Becsült idő: 1-2 óra)

#### 1.1 Middleware Test Fix
**Probléma:** `TypeError: NextRequest is not a constructor`

**Megoldás:**
```typescript
// Helyesen: NextRequest mock Next.js környezetben
import { NextRequest } from 'next/server';

// Mock strategy változtatás:
// 1. Használjuk a tényleges NextRequest-et
// 2. Vagy: Mock Request object Next.js kompatibilis módon
```

**Várható eredmény:**
- Middleware coverage: 80%+ (jelenleg 11.53%)
- Összes middleware teszt átmegy (jelenleg 0/27 passed)

**Fájlok:**
- `test/functional/middleware.functional.test.ts`

---

#### 1.2 Rate-Limit Test Fixes
**Probléma 1:** `Content-Type` header undefined
**Probléma 2:** `Retry-After` számítás 0

**Megoldás:**
```typescript
// Response header ellenőrzés javítása
const response = createRateLimitResponse(rateLimitResult);

// Fix 1: Check raw headers object
const headers = Object.fromEntries(response.headers.entries());
expect(headers['content-type']).toContain('application/json');

// Fix 2: Időzítés javítása
const resetTime = Date.now() + 120000;
// Add small delay to ensure time progression
await new Promise(resolve => setTimeout(resolve, 10));
```

**Várható eredmény:**
- Rate-limit coverage: 85%+ (jelenleg 76.31%)
- Összes rate-limit teszt átmegy (jelenleg 63/65 passed)

**Fájlok:**
- `test/functional/rate-limit.functional.test.ts`
- `src/lib/rate-limit-simple.ts` (esetleg header fix)

---

#### 1.3 Validation Test Fix
**Probléma:** `Cannot read properties of undefined (reading '0')`

**Megoldás:**
```typescript
// Error path ellenőrzés biztonságosan
if (!result.success) {
  const nameError = result.error.errors.find(e => e.path.includes('name'));
  expect(nameError).toBeDefined();
  expect(nameError?.message).toContain('legalább 2 karakter');
}
```

**Várható eredmény:**
- Validation coverage: 100% (már elérve, csak fix kell)
- Összes validation teszt átmegy (jelenleg 98/99 passed)

**Fájlok:**
- `test/functional/validation.functional.test.ts`

---

### Phase 2: Coverage Verification (Becsült idő: 30 perc)

**Feladat:** Ellenőrizni, hogy a kritikus biztonsági fájlok elérték-e a 80%+ coverage-t

**Coverage célok:**
| Fájl | Jelenlegi | Cél | Státusz |
|------|-----------|-----|---------|
| `src/lib/rate-limit-simple.ts` | 76% | 85% | 🟡 Közel |
| `src/lib/validations/common.ts` | 100% | 80% | ✅ Kész |
| `src/lib/validations/newsletter.ts` | 100% | 80% | ✅ Kész |
| `src/middleware.ts` | 11% | 80% | 🔴 Kell javítás |

**Lépések:**
1. Functional tesztek javítása után coverage riport generálása
2. Coverage HTML riport átnézése: `coverage-functional/lcov-report/index.html`
3. Hiányzó sorok azonosítása
4. Kiegészítő tesztek írása, ha szükséges

**Deliverable:**
- `COVERAGE_REPORT.md` - Részletes coverage elemzés
- Screenshot a coverage riportból

---

### Phase 3: Newsletter Flow Tests (Becsült idő: 2-3 óra)

**Scope:** Teljes newsletter lifecycle tesztelése

#### 3.1 Newsletter Subscribe Flow
```typescript
describe('Newsletter Subscribe - Full Flow', () => {
  it('EXECUTES: Complete subscription with validation', async () => {
    // 1. Input validation
    // 2. Rate limiting check
    // 3. Database insert (mocked)
    // 4. Email confirmation (mocked)
  });

  it('EXECUTES: Duplicate subscription handling', async () => {
    // Existing email detection
  });

  it('EXECUTES: Invalid category rejection', async () => {
    // Category validation
  });
});
```

#### 3.2 Newsletter Unsubscribe Flow
```typescript
describe('Newsletter Unsubscribe - Full Flow', () => {
  it('EXECUTES: Unsubscribe with token', async () => {
    // Token validation
    // Database update
  });

  it('EXECUTES: Unsubscribe with email', async () => {
    // Email lookup
    // Confirmation
  });
});
```

#### 3.3 Newsletter Campaign Send
```typescript
describe('Newsletter Campaign - Full Flow', () => {
  it('EXECUTES: Admin-only access', async () => {
    // Middleware auth check
  });

  it('EXECUTES: Recipient selection validation', async () => {
    // Category/all/selected logic
  });

  it('EXECUTES: Rate limiting for sends', async () => {
    // Prevent spam
  });
});
```

**Fájlok:**
- `test/functional/newsletter-flow.functional.test.ts` (ÚJ)

---

### Phase 4: OWASP Compliance Mapping (Becsült idő: 1 óra)

**Feladat:** Dokumentálni, hogy mely tesztek fedik le az OWASP Top 10 kategóriákat

**Struktúra:**
```markdown
# OWASP Top 10 2021 - Test Coverage Mapping

## A01:2021 - Broken Access Control
✅ COVERED
- Test: `test/functional/middleware.functional.test.ts`
  - Line 202: Horizontal privilege escalation prevention
  - Line 228: Direct admin access prevention
  - Line 245: Token validation

Coverage: 85%

## A03:2021 - Injection
✅ COVERED
- Test: `test/functional/validation.functional.test.ts`
  - Line 512: SQL injection in email
  - Line 525: XSS patterns in name
  - Line 538: Path traversal in filename
  - Line 551: Command injection in search

Coverage: 100%

## A07:2021 - Identification and Authentication Failures
✅ COVERED
- Test: `test/functional/middleware.functional.test.ts`
  - Line 256: JWT token requirement
  - Line 267: RBAC verification
  - Line 291: Proper error messages

Coverage: 85%
```

**Deliverable:**
- `OWASP_COMPLIANCE_MAPPING.md`
- Vizuális diagram (opcionális)

---

### Phase 5: Final Audit Report (Becsült idő: 1 óra)

**Feladat:** Professzionális, audit-ready jelentés készítése

**Tartalma:**
1. **Executive Summary**
   - Valós coverage számok
   - OWASP lefedettség
   - Azonosított és javított hibák

2. **Technical Details**
   - Test execution logs
   - Coverage riportok
   - Teszt stratégia

3. **Security Posture**
   - Mitigated risks
   - Remaining risks
   - Recommendations

4. **Reproducibility**
   - Pontos parancsok a tesztek futtatásához
   - CI/CD integráció útmutató
   - Karbantartási terv

**Fájlok:**
- `SECURITY_AUDIT_FINAL_REPORT.md` (ÚJ)
- `SECURITY_TEST_REPORT_v2.md` (FRISSÍTÉS)

---

### Phase 6: Documentation & Knowledge Transfer (Becsült idő: 1 óra)

**Feladat:** Dokumentáció, ami lehetővé teszi a tesztek karbantartását

#### 6.1 Test Strategy Document
```markdown
# Security Test Strategy

## Test Pyramid
- Unit Tests: Validation, utils (100%)
- Functional Tests: Rate limiting, middleware (85%)
- Integration Tests: API endpoints (planned)
- E2E Tests: Critical flows (planned)

## Running Tests
npm test -- test/functional          # All functional tests
npm test -- test/functional --coverage  # With coverage

## Adding New Tests
1. Identify security-critical code
2. Write functional test in test/functional/
3. Ensure 80%+ coverage
4. Document OWASP mapping
```

#### 6.2 Maintenance Guide
```markdown
# Test Maintenance Guide

## Monthly Tasks
- [ ] Update dependencies
- [ ] Run full test suite
- [ ] Review coverage trends

## When Adding Features
- [ ] Write security tests FIRST
- [ ] Ensure coverage stays >80%
- [ ] Update OWASP mapping

## Red Flags
- Coverage drops below 80%
- New security endpoint without tests
- Test failures in CI/CD
```

**Fájlok:**
- `docs/SECURITY_TEST_STRATEGY.md` (ÚJ)
- `docs/TEST_MAINTENANCE_GUIDE.md` (ÚJ)
- `README.md` (FRISSÍTÉS - teszt szekció)

---

## Összefoglalás - Teljes Ütemterv

| Phase | Feladat | Idő | Prioritás | Deliverable |
|-------|---------|-----|-----------|-------------|
| 1.1 | Middleware test fix | 30m | 🔴 KRITIKUS | Működő middleware tesztek |
| 1.2 | Rate-limit test fixes | 20m | 🔴 KRITIKUS | 85%+ coverage |
| 1.3 | Validation test fix | 10m | 🟡 MAGAS | 100% passing tests |
| 2 | Coverage verification | 30m | 🔴 KRITIKUS | COVERAGE_REPORT.md |
| 3 | Newsletter flow tests | 2-3h | 🟡 MAGAS | newsletter-flow.functional.test.ts |
| 4 | OWASP mapping | 1h | 🟡 MAGAS | OWASP_COMPLIANCE_MAPPING.md |
| 5 | Final audit report | 1h | 🔴 KRITIKUS | SECURITY_AUDIT_FINAL_REPORT.md |
| 6 | Documentation | 1h | 🟢 KÖZEPES | Strategy & Maintenance docs |

**Teljes becsült idő:** 6-8 óra
**Minimum viable (Phase 1-2, 5):** 2-3 óra

---

## Következő Lépés

**MOST:** Phase 1.1 kezdése - Middleware test javítása

**Kérdés:** Végigmegyünk minden fázison sorban, vagy a kritikus fázisokra (1-2, 5) koncentrálunk?
