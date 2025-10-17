# Hírlevél Rendszer - Integrált Tesztelési Terv

## 📋 Áttekintés

**Cél**: A hírlevél rendszer teljes körű integrált tesztelése, különös tekintettel:
- Newsletter kategóriák kezelésére
- Kampány létrehozásra és küldésre
- Feliratkozók szűrésére kategóriák szerint
- API végpontok helyes működésére

**Teszt típusok**:
1. ✅ **Unit tesztek** - Egyedi függvények, utility funkciók
2. ✅ **Integration tesztek** - API végpontok, adatbázis műveletek
3. ✅ **E2E tesztek** - Teljes user flow tesztelése

---

## 1. Teszt Környezet Előkészítése

### 1.1 Teszt Adatbázis

**Teszt feliratkozók létrehozása különböző kategóriákkal:**

```typescript
// test/fixtures/newsletter-subscribers.ts
export const testSubscribers = [
  {
    email: 'szakpolitika@test.com',
    name: 'Szakpolitika Teszt',
    categories: ['SZAKPOLITIKA'],
    isActive: true
  },
  {
    email: 'vkerulet@test.com',
    name: 'V. Kerület Teszt',
    categories: ['V_KERULET'],
    isActive: true
  },
  {
    email: 'edugame@test.com',
    name: 'Edugame Teszt',
    categories: ['POLITIKAI_EDUGAMIFIKACIO'],
    isActive: true
  },
  {
    email: 'eu@test.com',
    name: 'EU Teszt',
    categories: ['EU'],
    isActive: true
  },
  {
    email: 'multi@test.com',
    name: 'Multi Kategória Teszt',
    categories: ['SZAKPOLITIKA', 'EU', 'V_KERULET'],
    isActive: true
  },
  {
    email: 'inactive@test.com',
    name: 'Inaktív Teszt',
    categories: ['SZAKPOLITIKA'],
    isActive: false // Nem kaphat emailt!
  }
];
```

### 1.2 Teszt Környezeti Változók

```env
# .env.test
DATABASE_URL="postgresql://test:test@localhost:5432/newsletter_test"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="test-secret-key"
RESEND_API_KEY="test-api-key" # Mock
NODE_ENV="test"
```

---

## 2. Integration Tesztek (API Végpontok)

### 2.1 Newsletter Subscribers API

**Fájl**: `test/integration/newsletter/subscribers.test.ts`

**Tesztelendő esetek:**

#### TC1: Összes feliratkozó lekérdezése
```typescript
describe('GET /api/admin/newsletter/subscribers', () => {
  it('should return all subscribers for admin', async () => {
    // Arrange
    const adminSession = await createAdminSession();

    // Act
    const response = await fetch('/api/admin/newsletter/subscribers', {
      headers: { Cookie: adminSession.cookie }
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(6); // 6 teszt feliratkozó
  });

  it('should return 401 for non-admin users', async () => {
    // Arrange
    const userSession = await createUserSession(); // USER role

    // Act
    const response = await fetch('/api/admin/newsletter/subscribers', {
      headers: { Cookie: userSession.cookie }
    });

    // Assert
    expect(response.status).toBe(401);
  });
});
```

#### TC2: Feliratkozó státusz módosítás
```typescript
describe('PATCH /api/admin/newsletter/subscribers/[id]', () => {
  it('should toggle subscriber active status', async () => {
    // Arrange
    const subscriber = await prisma.newsletterSubscription.findFirst({
      where: { email: 'szakpolitika@test.com' }
    });
    const adminSession = await createAdminSession();

    // Act
    const response = await fetch(`/api/admin/newsletter/subscribers/${subscriber.id}`, {
      method: 'PATCH',
      headers: {
        Cookie: adminSession.cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive: false })
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.isActive).toBe(false);
  });
});
```

### 2.2 Newsletter Send API (Kategória szűrés)

**Fájl**: `test/integration/newsletter/send-category.test.ts`

#### TC3: Kategória szerinti küldés - SZAKPOLITIKA
```typescript
describe('POST /api/admin/newsletter/send - Category filtering', () => {
  it('should send only to SZAKPOLITIKA subscribers', async () => {
    // Arrange
    const adminSession = await createAdminSession();
    const emailMock = jest.spyOn(resend.emails, 'send').mockResolvedValue({ id: 'test-id' });

    // Act
    const response = await fetch('/api/admin/newsletter/send', {
      method: 'POST',
      headers: {
        Cookie: adminSession.cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'Szakpolitikai Hírlevél',
        content: '<p>Teszt tartalom</p>',
        recipients: 'category',
        selectedCategory: 'SZAKPOLITIKA'
      })
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sentCount).toBe(2); // szakpolitika@test.com + multi@test.com

    // Verify emails sent to correct recipients
    expect(emailMock).toHaveBeenCalledTimes(2);
    expect(emailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'szakpolitika@test.com' })
    );
    expect(emailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'multi@test.com' })
    );

    // Verify NOT sent to others
    expect(emailMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ to: 'vkerulet@test.com' })
    );
  });

  it('should send only to V_KERULET subscribers', async () => {
    // Arrange
    const adminSession = await createAdminSession();
    const emailMock = jest.spyOn(resend.emails, 'send').mockResolvedValue({ id: 'test-id' });

    // Act
    const response = await fetch('/api/admin/newsletter/send', {
      method: 'POST',
      headers: {
        Cookie: adminSession.cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'V. Kerületi Hírlevél',
        content: '<p>Kerületi hírek</p>',
        recipients: 'category',
        selectedCategory: 'V_KERULET'
      })
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.sentCount).toBe(2); // vkerulet@test.com + multi@test.com
  });

  it('should NOT send to inactive subscribers', async () => {
    // Arrange
    const adminSession = await createAdminSession();
    const emailMock = jest.spyOn(resend.emails, 'send').mockResolvedValue({ id: 'test-id' });

    // Act
    const response = await fetch('/api/admin/newsletter/send', {
      method: 'POST',
      headers: {
        Cookie: adminSession.cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'Szakpolitikai Hírlevél',
        content: '<p>Teszt</p>',
        recipients: 'category',
        selectedCategory: 'SZAKPOLITIKA'
      })
    });
    const data = await response.json();

    // Assert - inactive@test.com-nak NEM megy ki!
    expect(emailMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ to: 'inactive@test.com' })
    );
  });

  it('should return error if category not specified', async () => {
    // Arrange
    const adminSession = await createAdminSession();

    // Act
    const response = await fetch('/api/admin/newsletter/send', {
      method: 'POST',
      headers: {
        Cookie: adminSession.cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'Hírlevél',
        content: '<p>Teszt</p>',
        recipients: 'category',
        // selectedCategory: NINCS! ❌
      })
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toContain('Category is required');
  });
});
```

### 2.3 Newsletter Campaigns API

**Fájl**: `test/integration/newsletter/campaigns.test.ts`

#### TC4: Kampány létrehozása
```typescript
describe('POST /api/admin/newsletter/campaigns', () => {
  it('should create campaign with category targeting', async () => {
    // Arrange
    const adminSession = await createAdminSession();

    // Act
    const response = await fetch('/api/admin/newsletter/campaigns', {
      method: 'POST',
      headers: {
        Cookie: adminSession.cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'EU Hírlevél Kampány',
        subject: 'Európai Uniós Hírek',
        content: '<p>EU tartalom</p>',
        recipientType: 'category',
        selectedCategory: 'EU',
        sendType: 'scheduled',
        scheduledAt: new Date(Date.now() + 86400000).toISOString() // Holnap
      })
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('SCHEDULED');
    expect(data.data.recipientType).toBe('category');
  });
});
```

### 2.4 Newsletter Stats API

**Fájl**: `test/integration/newsletter/stats.test.ts`

#### TC5: Statisztikák lekérdezése
```typescript
describe('GET /api/admin/newsletter/stats', () => {
  it('should return correct subscriber counts', async () => {
    // Arrange
    const adminSession = await createAdminSession();

    // Act
    const response = await fetch('/api/admin/newsletter/stats', {
      headers: { Cookie: adminSession.cookie }
    });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.totalSubscribers).toBe(6);
    expect(data.activeSubscribers).toBe(5); // 1 inaktív
  });
});
```

---

## 3. Frontend Komponens Tesztek

### 3.1 Új Kampány Komponens

**Fájl**: `test/unit/newsletter/NewCampaignPage.test.tsx`

#### TC6: Kategória választó megjelenítés
```typescript
describe('NewCampaignPage - Category Selection', () => {
  it('should show category dropdown when "category" recipient type selected', () => {
    // Arrange
    render(<NewCampaignPage />);

    // Act
    const categoryRadio = screen.getByLabelText('Kategória szerint');
    fireEvent.click(categoryRadio);

    // Assert
    expect(screen.getByLabelText('Válassz Kategóriát')).toBeInTheDocument();
    expect(screen.getByText('Szakpolitika')).toBeInTheDocument();
    expect(screen.getByText('V. Kerület')).toBeInTheDocument();
    expect(screen.getByText('Politikai Edugamifikáció')).toBeInTheDocument();
    expect(screen.getByText('Európai Unió')).toBeInTheDocument();
  });

  it('should validate category selection before submit', async () => {
    // Arrange
    render(<NewCampaignPage />);

    // Act
    fireEvent.click(screen.getByLabelText('Kategória szerint'));
    fireEvent.change(screen.getByLabelText('Email Tárgy'), {
      target: { value: 'Teszt tárgy' }
    });
    fireEvent.change(screen.getByLabelText('Email Tartalom'), {
      target: { value: '<p>Tartalom</p>' }
    });
    fireEvent.click(screen.getByText('Kampány Létrehozása'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Válassz kategóriát!')).toBeInTheDocument();
    });
  });
});
```

### 3.2 Feliratkozók Komponens

**Fájl**: `test/unit/newsletter/SubscribersPage.test.tsx`

#### TC7: Kategória szűrő
```typescript
describe('SubscribersPage - Category Filter', () => {
  it('should filter subscribers by category', async () => {
    // Arrange
    const mockSubscribers = testSubscribers;
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ success: true, data: mockSubscribers }),
      ok: true
    } as Response);

    render(<SubscribersPage />);
    await waitFor(() => screen.getByText('szakpolitika@test.com'));

    // Act
    const categoryFilter = screen.getByLabelText('Kategória');
    fireEvent.change(categoryFilter, { target: { value: 'SZAKPOLITIKA' } });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('szakpolitika@test.com')).toBeInTheDocument();
      expect(screen.getByText('multi@test.com')).toBeInTheDocument();
      expect(screen.queryByText('vkerulet@test.com')).not.toBeInTheDocument();
    });
  });

  it('should display category labels correctly', async () => {
    // Arrange
    render(<SubscribersPage />);
    await waitFor(() => screen.getByText('multi@test.com'));

    // Assert - Readable labels
    expect(screen.getByText('Szakpolitika')).toBeInTheDocument();
    expect(screen.getByText('V. Kerület')).toBeInTheDocument();
    expect(screen.getByText('Európai Unió')).toBeInTheDocument();

    // Assert - NOT showing raw enum values
    expect(screen.queryByText('V_KERULET')).not.toBeInTheDocument();
  });
});
```

---

## 4. E2E Tesztek (Playwright/Cypress)

### 4.1 Teljes Newsletter Küldési Flow

**Fájl**: `test/e2e/newsletter/send-category.spec.ts`

#### TC8: Admin létrehoz kategória szerinti kampányt
```typescript
describe('Newsletter Category Campaign - E2E', () => {
  it('should create and send newsletter to specific category', async ({ page }) => {
    // 1. Login as admin
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 2FA
    await page.fill('input[name="code"]', '123456'); // Mock code
    await page.click('button:has-text("Bejelentkezés")');

    // 2. Navigate to Newsletter
    await page.click('text=Hírlevél'); // Sidebar menu
    await page.waitForURL('**/admin/newsletter');

    // 3. Create new campaign
    await page.click('text=Új Kampány');
    await page.waitForURL('**/admin/newsletter/campaigns/new');

    // 4. Fill form
    await page.fill('input[placeholder*="Kampány Neve"]', 'EU Teszt Kampány');
    await page.fill('input[placeholder*="Email tárgy"]', 'EU Hírek - Október');
    await page.fill('textarea', '<h2>Európai Uniós Hírek</h2><p>Fontos fejlemények...</p>');

    // 5. Select category recipient type
    await page.click('label:has-text("Kategória szerint")');

    // 6. Select EU category
    await page.selectOption('select', 'EU');

    // 7. Verify selected
    const selected = await page.locator('select').inputValue();
    expect(selected).toBe('EU');

    // 8. Set to immediate send
    await page.click('label:has-text("Azonnal")');

    // 9. Submit
    await page.click('button:has-text("Kampány Létrehozása")');

    // 10. Verify success
    await page.waitForURL('**/admin/newsletter/campaigns');
    await expect(page.locator('text=EU Teszt Kampány')).toBeVisible();
  });
});
```

#### TC9: Feliratkozók szűrése kategória szerint
```typescript
describe('Newsletter Subscribers Filtering - E2E', () => {
  it('should filter subscribers by V_KERULET category', async ({ page }) => {
    // 1. Login & navigate
    await loginAsAdmin(page);
    await page.goto('http://localhost:3000/admin/newsletter/subscribers');

    // 2. Wait for subscribers to load
    await expect(page.locator('text=szakpolitika@test.com')).toBeVisible();

    // 3. Select V_KERULET filter
    await page.selectOption('select[aria-label*="Kategória"]', 'V_KERULET');

    // 4. Verify filtered results
    await expect(page.locator('text=vkerulet@test.com')).toBeVisible();
    await expect(page.locator('text=multi@test.com')).toBeVisible();

    // 5. Verify others hidden
    await expect(page.locator('text=szakpolitika@test.com')).not.toBeVisible();
    await expect(page.locator('text=edugame@test.com')).not.toBeVisible();
  });

  it('should export filtered subscribers to CSV', async ({ page }) => {
    // 1. Filter by category
    await loginAsAdmin(page);
    await page.goto('http://localhost:3000/admin/newsletter/subscribers');
    await page.selectOption('select[aria-label*="Kategória"]', 'SZAKPOLITIKA');

    // 2. Click CSV export
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("CSV Exportálás")')
    ]);

    // 3. Verify CSV content
    const path = await download.path();
    const csv = await fs.readFile(path, 'utf-8');

    expect(csv).toContain('szakpolitika@test.com');
    expect(csv).toContain('multi@test.com');
    expect(csv).not.toContain('vkerulet@test.com');
  });
});
```

---

## 5. Teszt Futtatási Terv

### 5.1 Előkészítés

**1. Teszt adatbázis inicializálás:**
```bash
# Teszt DB létrehozása
npm run db:test:setup

# Migráció futtatása
npm run db:test:migrate

# Seed adatok betöltése
npm run db:test:seed
```

**2. Email mock setup:**
```typescript
// test/utils/email-mock.ts
export const setupEmailMock = () => {
  jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({ id: 'mock-email-id' })
      }
    }))
  }));
};
```

### 5.2 Teszt Futtatás Sorrendje

**1. Unit tesztek** (gyors, izolált):
```bash
npm run test:unit -- test/unit/newsletter
```

**2. Integration tesztek** (adatbázis + API):
```bash
npm run test:integration -- test/integration/newsletter
```

**3. E2E tesztek** (teljes alkalmazás):
```bash
npm run test:e2e -- test/e2e/newsletter
```

**4. Teljes teszt suite**:
```bash
npm run test:all
```

### 5.3 Coverage célok

- **Unit tesztek**: >80% coverage
- **Integration tesztek**: >70% coverage (API routes)
- **E2E tesztek**: Főbb user flow-k lefedése

---

## 6. Teszt Esetek Összefoglalása

| # | Teszt neve | Típus | Prioritás | Időigény |
|---|------------|-------|-----------|----------|
| TC1 | Feliratkozók lekérdezés | Integration | HIGH | 10 perc |
| TC2 | Státusz módosítás | Integration | HIGH | 15 perc |
| TC3 | SZAKPOLITIKA küldés | Integration | **CRITICAL** | 20 perc |
| TC4 | Kampány létrehozás | Integration | HIGH | 15 perc |
| TC5 | Statisztikák | Integration | MEDIUM | 10 perc |
| TC6 | Kategória UI megjelenés | Unit | HIGH | 15 perc |
| TC7 | Feliratkozók szűrés | Unit | HIGH | 15 perc |
| TC8 | Teljes kampány flow | E2E | **CRITICAL** | 30 perc |
| TC9 | CSV export szűrve | E2E | MEDIUM | 20 perc |

**Összesen**: ~2.5 óra implementálás + 30 perc futtatás

---

## 7. Kritikus Tesztelési Pontok

### ✅ KELL Tesztelni:

1. **Kategória szűrés pontossága**
   - Csak a megfelelő kategóriájú feliratkozók kapják meg
   - Multi-kategóriás feliratkozók mindegyik kategóriához tartoznak
   - Inaktív feliratkozók SOHA nem kapnak emailt

2. **API biztonsága**
   - Csak ADMIN role férhet hozzá
   - USER/GUEST role-nak 401 hibát ad

3. **Adatbázis konzisztencia**
   - Categories JSON string helyesen parse-olódik
   - Email címek unique constraint működik

4. **Email küldés**
   - Batch processing működik (10 email/batch)
   - Hibakezelés (ha egy email sikertelen, folytatódik a többi)
   - Unsubscribe link minden emailben van

### ❌ NEM Kell Most Tesztelni:

- Email template renderelés (későbbi feladat)
- A/B tesztelés (még nincs implementálva)
- Scheduled sending (cron job, külön teszt)

---

## 8. Következő Lépések

**Prioritási sorrend:**

1. **MOST** ✅
   - TC3: Kategória szerinti küldés integration teszt
   - TC8: Teljes E2E flow teszt

2. **Azonnal utána** 🔄
   - TC1, TC2: Subscribers API tesztek
   - TC6, TC7: Frontend unit tesztek

3. **Opcionális** 💡
   - TC4, TC5: Campaigns & Stats tesztek
   - TC9: CSV export teszt

---

## 9. Sikerkritériumok

A tesztelés akkor sikeres, ha:

✅ Minden integration teszt zöld (100%)
✅ E2E tesztek lefutnak hiba nélkül
✅ Kategória szűrés pontosan működik
✅ Csak aktív + megfelelő kategóriájú feliratkozók kapnak emailt
✅ Admin jogosultság ellenőrzés működik
✅ UI helyesen jeleníti meg a kategóriákat

---

**Készítette**: Claude AI
**Dátum**: 2024. október 17.
**Verzió**: 1.0
**Következő felülvizsgálat**: Tesztek implementálása után
