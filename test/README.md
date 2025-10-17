# Test Directory Structure

Ez a könyvtár tartalmazza a projekt összes teszt és teszt-támogató szkriptjét egy rendezett struktúrában.

## Struktúra

### 📁 test/unit/
Unit tesztek - izolált komponensek és függvények tesztelése
- **admin/** - Admin felület komponensek
- **components/** - React komponensek
- **lib/** - Utility funkciók és könyvtárak

### 📁 test/integration/
Integrációs tesztek - API-k, adatbázis műveletek
- **api/** - API endpoint tesztek
- **database/** - Adatbázis műveletek
- **security-auth-test.js** - Biztonsági és autentikációs tesztek

### 📁 test/e2e/
End-to-end tesztek - teljes felhasználói folyamatok
- **admin-auth.test.ts** - Admin bejelentkezési flow

### 📁 test/scripts/
Teszt és fejlesztői támogató szkriptek

#### test/scripts/campaign/
Kampány és email sequence teszt szkriptek
- create-demo-sequence.js
- create-*-test-sequence.js
- cleanup-test-sequences.js

#### test/scripts/monitoring/
Monitoring és tracking szkriptek
- monitor-*.js
- check-email-tracking.js

#### test/scripts/seed/
Adatbázis seed és teszt adat szkriptek
- debug-prisma.js
- get-mock-posts.js
- test-simple-partner.ts
- test-email.js

#### test/scripts/load-testing/
Terhelési tesztek
- load-test.js
- simple-load-test.js

### 📁 test/fixtures/
Teszt adatok és mockolt objektumok
- **mocks/** - Mock implementációk
- **mock-data/** - Teszt adatok

### 📁 test/utils/
Teszt utility funkciók és konfigurációk
- jest.setup.js - Jest konfiguráció

### 📁 test/reports/
Teszt futtatások eredményei
- Teszt riportok (.html, .log)

## Használat

### Unit tesztek futtatása
```bash
npm run test              # Összes unit és integration teszt
npm run test:watch        # Watch módban
npm run test:coverage     # Coverage riporttal
```

### E2E tesztek futtatása
```bash
npm run test:e2e         # Playwright e2e tesztek
```

### Szkriptek futtatása
```bash
# Seed szkriptek
npx tsx test/scripts/seed/test-simple-partner.ts

# Kampány teszt
node test/scripts/campaign/create-demo-sequence.js

# Load testing
node test/scripts/load-testing/load-test.js

# Monitoring
node test/scripts/monitoring/monitor-test-sequence.js
```

## Best Practices

1. **Unit tesztek**: Csak az adott komponens/függvény funkcionalitását tesztelik
2. **Integration tesztek**: API-k és adatbázis interakciók tesztelése
3. **E2E tesztek**: Teljes felhasználói flow-k böngészőben
4. **Teszt szkriptek**: Fejlesztés során használt segédeszközök, NEM production kód

## Konfiguráció

- **jest.config.mjs** - Jest unit/integration teszt konfiguráció
- **vitest.config.ts** - Vitest (Storybook) konfiguráció
- **test/utils/jest.setup.js** - Jest setup és globális konfigurációk
