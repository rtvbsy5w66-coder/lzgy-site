# Tesztelési Módszertan és Best Practices

## Áttekintés

A projekt tesztjei át lettek strukturálva egy egyértelmű, karbantartható felépítésbe. Ez a dokumentum tartalmazza a tesztelési módszertant és ajánlásokat.

## 📂 Új Teszt Struktúra

```
test/
├── unit/              # Unit tesztek
│   ├── admin/        # Admin komponensek
│   ├── components/   # React komponensek
│   └── lib/          # Utility funkciók
├── integration/       # Integrációs tesztek
│   ├── api/          # API endpoint tesztek
│   └── database/     # DB műveletek
├── e2e/              # End-to-end tesztek
├── scripts/          # Fejlesztői szkriptek
│   ├── campaign/     # Kampány tesztek
│   ├── monitoring/   # Monitoring szkriptek
│   ├── seed/         # Seed és adat szkriptek
│   └── load-testing/ # Terhelési tesztek
├── fixtures/         # Teszt adatok
│   ├── mocks/        # Mock objektumok
│   └── mock-data/    # Teszt adatok
├── utils/            # Teszt utilities
└── reports/          # Teszt eredmények
```

## 🎯 Tesztelési Piramis

### 1. Unit Tesztek (70%)
**Cél**: Egyedi komponensek, függvények izolált tesztelése

**Mikor használd:**
- React komponensek renderelése
- Utility funkciók logikája
- Hooks működése
- Kisebb kalkulációk, validációk

**Példa:**
```typescript
// test/unit/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

**Best Practices:**
- Gyorsak legyenek (< 100ms)
- Egyetlen dolgot teszteljenek
- Ne használjanak valódi API-t vagy adatbázist
- Mockoljanak minden külső függőséget

### 2. Integration Tesztek (20%)
**Cél**: Komponensek együttműködésének tesztelése

**Mikor használd:**
- API endpoint működés
- Adatbázis műveletek
- Autentikáció flow-k
- Több komponens együttműködése

**Példa:**
```typescript
// test/integration/api/posts.test.ts
import { POST } from '@/app/api/posts/route'
import { prisma } from '@/lib/prisma'

describe('POST /api/posts', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany()
  })

  it('creates a new post', async () => {
    const response = await POST(new Request('...', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' })
    }))
    
    expect(response.status).toBe(201)
    const post = await prisma.post.findFirst()
    expect(post?.title).toBe('Test')
  })
})
```

**Best Practices:**
- Használjanak teszt adatbázist
- Tisztítsák az adatokat minden teszt előtt/után
- Teszteljenek edge case-eket
- Validálják a teljes adatfolyamot

### 3. E2E Tesztek (10%)
**Cél**: Teljes felhasználói flow-k tesztelése böngészőben

**Mikor használd:**
- Kritikus felhasználói útvonalak
- Autentikációs flow-k
- Komplex multi-step folyamatok
- Cross-browser kompatibilitás

**Példa:**
```typescript
// test/e2e/admin-auth.test.ts
import { test, expect } from '@playwright/test'

test('admin login flow', async ({ page }) => {
  await page.goto('/admin/login')
  await page.click('button:has-text("Bejelentkezés")')
  await expect(page).toHaveURL(/.*admin.*/)
})
```

**Best Practices:**
- Csak kritikus flow-kat teszteljenek
- Lassúak, ezért kevés legyen belőlük
- Használjanak page object pattern-t
- Független tesztadatokkal dolgozzanak

## 🛠️ Fejlesztői Szkriptek vs. Tesztek

### test/scripts/ mappa használata

**NEM tesztek**, hanem fejlesztői eszközök:
- Seed szkriptek (adatbázis feltöltés)
- Monitoring és debugging eszközök
- Kampány generátorok (email sequence-ek)
- Load testing eszközök
- One-off adat migrációk

**Miért különítjük el:**
1. **Nem automatikusan futnak** - Manuálisan futtatandók
2. **Nem validálnak** - Nem assertelik az eredményeket
3. **Módosítanak adatokat** - Írnak az adatbázisba
4. **Fejlesztői eszközök** - Nem production kód

**Példa használat:**
```bash
# Teszt adatok generálása
npx tsx test/scripts/seed/test-simple-partner.ts

# Email kampány tesztelése
node test/scripts/campaign/create-demo-sequence.js

# Monitoring
node test/scripts/monitoring/check-email-tracking.js
```

## 📋 Ajánlott Tesztelési Stratégia

### Új Feature Fejlesztésekor

1. **Unit teszt írása ELŐSZÖR** (TDD)
   ```bash
   # Komponens teszt
   touch test/unit/components/NewFeature.test.tsx
   ```

2. **Implementáció**
   ```bash
   # Komponens kód
   touch src/components/NewFeature.tsx
   ```

3. **Integration teszt** (ha API-val kommunikál)
   ```bash
   # API teszt
   touch test/integration/api/new-feature.test.ts
   ```

4. **E2E teszt** (ha kritikus user flow)
   ```bash
   # E2E teszt
   touch test/e2e/new-feature-flow.test.ts
   ```

### Bug Fixelésekor

1. **Reprodukáló teszt írása**
   - Írj egy failing tesztet, ami demonstrálja a bugot

2. **Fix implementálása**
   - Javítsd a kódot

3. **Teszt zöldre válik**
   - A teszt átmegy, és megakadályozza a regressziót

### Refaktoráláskor

1. **Meglévő tesztek futtatása**
   ```bash
   npm run test:watch
   ```

2. **Refaktorálás**
   - Tesztek zöldek maradnak

3. **Tesztek frissítése** (ha szükséges)
   - Csak akkor, ha az API változik

## 🔧 Konfigurációk

### Jest (Unit + Integration)
- **Konfig**: `jest.config.mjs`
- **Setup**: `test/utils/jest.setup.js`
- **Futtatás**: `npm run test`

### Playwright (E2E)
- **Konfig**: `playwright.config.ts`
- **Futtatás**: `npm run test:e2e`

### Vitest (Storybook)
- **Konfig**: `vitest.config.ts`
- **Futtatás**: Storybook integration része

## 📊 Coverage Célok

- **Overall Coverage**: > 80%
- **Critical Paths**: 100%
- **Business Logic**: > 90%
- **UI Components**: > 70%

```bash
npm run test:coverage
```

## 🚀 CI/CD Integráció

### GitHub Actions
```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: npm run test

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Coverage
  run: npm run test:coverage
```

## 🎨 Testing Best Practices

### DO ✅

1. **Írj beszédes teszt neveket**
   ```typescript
   it('displays error message when email is invalid')
   ```

2. **Arrange-Act-Assert pattern**
   ```typescript
   // Arrange
   const user = createTestUser()
   // Act
   const result = validateUser(user)
   // Assert
   expect(result.isValid).toBe(true)
   ```

3. **Tesztelj edge case-eket**
   - Üres értékek
   - Null/undefined
   - Határértékek
   - Hibás input

4. **Független tesztek**
   - Minden teszt önállóan futtatható
   - Nem függenek egymás sorrendjétől

5. **Használj testing library best practices-t**
   ```typescript
   // ✅ Jó
   screen.getByRole('button', { name: /submit/i })
   
   // ❌ Rossz
   container.querySelector('.submit-button')
   ```

### DON'T ❌

1. **Ne tesztelj implementációs részleteket**
   ```typescript
   // ❌ Rossz
   expect(component.state.counter).toBe(5)
   
   // ✅ Jó
   expect(screen.getByText('Count: 5')).toBeInTheDocument()
   ```

2. **Ne használj sleep/timeout-ot**
   ```typescript
   // ❌ Rossz
   await new Promise(resolve => setTimeout(resolve, 1000))
   
   // ✅ Jó
   await waitFor(() => expect(element).toBeInTheDocument())
   ```

3. **Ne tesztelj külső library-ket**
   - Feltételezd, hogy működnek
   - Csak a saját kódodat teszteld

4. **Ne írj túl bonyolult teszt setup-okat**
   - Ha egy teszt setup túl komplex, valószínűleg rossz az architektúra

## 📚 További Források

### Dokumentáció
- [Testing Library](https://testing-library.com/)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)

### Gyakorlati Példák
- `test/unit/` - Unit teszt példák
- `test/integration/` - Integration teszt példák
- `test/e2e/` - E2E teszt példák

## 🔄 Következő Lépések

1. **Lefedettség növelése**
   - Azonosítsd a nem tesztelt komponenseket
   - Írj unit teszteket az összes kritikus komponenshez

2. **E2E tesztek bővítése**
   - Add hozzá a kritikus felhasználói flow-kat
   - Autentikáció, regisztráció, payment flow-k

3. **CI/CD pipeline**
   - Automatikus teszt futtatás minden commit-nál
   - Coverage report generálás
   - Failed teszt esetén PR blokkolása

4. **Visual regression testing**
   - Chromatic integráció (már létező)
   - Screenshot összehasonlítás

5. **Performance testing**
   - Load testing szkriptek használata
   - Response time monitoring

---

**Készítette:** Claude Code  
**Dátum:** 2025-10-17  
**Verzió:** 1.0
