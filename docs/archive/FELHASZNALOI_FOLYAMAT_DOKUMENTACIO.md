# 📋 Felhasználói Folyamat Dokumentáció

## Áttekintés

Ez a dokumentum részletesen leírja a felhasználói folyamatokat (user flow) a Lovász Zoltán politikai platform három fő részvételi formájához: **kvízek**, **szavazások** és **petíciók**.

---

## 🧠 1. KVÍZEK - Felhasználói Folyamat

### 1.1 Kezdeti Betöltés
```
Felhasználó → /kviz/[id] URL → Kvíz adatok betöltése
```

**Technikai részletek:**
- `fetchQuiz()` API hívás: `GET /api/quizzes/[id]`
- Loading állapot megjelenítése
- Hibakezlés (404, 403, stb.)

### 1.2 Participation Choice (AZONNAL a betöltés után)
```
🎯 KRITIKUS LÉPÉS: Részvételi mód választása
```

**Mikor jelenik meg:**
- **AZONNAL** a kvíz betöltése után
- **ELŐTTE**: Mielőtt a felhasználó bármilyen kérdést látna
- **Feltétel**: `!hasChosen` állapot `true`

**Megjelenő opciók:**
1. **Anonim Részvétel**
   - Gyors, adatvédelem-centrikus
   - Nincs regisztráció szükséges
   - 30 napos automatikus törlés

2. **Regisztrált Részvétel**
   - Google bejelentkezés lehetősége
   - Automatikus adatok kitöltése
   - Hosszútávú kapcsolattartás

**UI Komponens:** `InteractiveParticipationFlow`
- `type="quiz"`
- `onChoice={handleParticipationChoice}` callback

### 1.3 Autentikáció (Opcionális)

**MIKOR:** Ha a felhasználó "Regisztrált Részvétel"-t választ

**FOLYAMAT:**
```
"Regisztrált Részvétel" gomb → Google OAuth dialog → Sikeres autentikáció → Automatikus adatok
```

**Technikai implementáció:**
```typescript
onLogin={() => signIn('google')}
```

**NextAuth Google OAuth:**
- Provider: Google
- Callback URL: `http://localhost:3001/api/auth/callback/google`
- Session tárolás: Database

### 1.4 Automatikus Adatok Kitöltése

**MIKOR:** Sikeres Google bejelentkezés után

**MIT TÖLT KI AUTOMATIKUSAN:**
```typescript
userData: {
  firstName: session.user?.name?.split(' ')[0] || '',
  lastName: session.user?.name?.split(' ').slice(1).join(' ') || '',
  email: session.user?.email || ''
}
```

**KOMPONENS:** `RegisteredParticipationForm`
- `useEffect` hook figyeli a session változást
- Automatikus form feltöltés

### 1.5 Kvíz Kitöltése

**MIKOR:** A részvételi mód kiválasztása után

**FOLYAMAT:**
```
Participation Choice → hasChosen = true → Kvíz kérdések megjelenítése
```

**Kvíz navigáció:**
- Kérdések egyenkénti megjelenítése
- Progress bar
- Időlimit követés (ha van)
- Válaszok tárolása state-ben

### 1.6 Beküldés

**KÜLÖNBSÉG a részvételi mód alapján:**

#### Anonim beküldés:
```typescript
handleDirectAnonymousSubmit() → POST /api/quizzes/[id]/submit-anonymous
```
**Payload:**
```json
{
  "answers": [...],
  "sessionId": "crypto.randomUUID()",
  "timeSpent": 180,
  "allowAnalytics": false
}
```

#### Regisztrált beküldés:
```typescript
handleDirectRegisteredSubmit() → POST /api/quizzes/[id]/submit
```
**Payload:**
```json
{
  "answers": [...],
  "timeSpent": 180,
  "userData": {
    "firstName": "János",
    "lastName": "Nagy", 
    "email": "janos.nagy@example.com"
  }
}
```

### 1.7 Eredmények

**Megjelenítés:**
- Pontszám és százalék
- Részletes válaszok (ha `showResults = true`)
- Magyarázatok
- Újraindítás lehetősége

---

## 🗳️ 2. SZAVAZÁSOK - Felhasználói Folyamat

### 2.1 Kezdeti Betöltés és Validációk

```
Felhasználó → /szavazasok/[id] → Szavazás betöltése → Időbeli validációk
```

**Speciális validációk:**
- **Időbeli korlátozások**: startDate, endDate
- **Szavazási jogosultság**: canVote ellenőrzés
- **Dupla szavazás védelem**: Felhasználó már szavazott-e

### 2.2 Participation Choice (AZONNAL)

**AZONOS logika, mint kvízeknél:**
- Anonim vs Regisztrált választás
- **ELSŐ LÉPÉS** a folyamatban
- InteractiveParticipationFlow használata

### 2.3 Autentikáció

**UGYANAZ**, mint kvízeknél:
- Google OAuth
- Session-based authentication
- Automatikus adatok kitöltése

### 2.4 Szavazás (Opcióválasztás)

**MIKOR:** Participation choice után

**FOLYAMAT:**
```
hasChosen = true → Szavazási opciók megjelenítése → Opcióválasztás → Beküldés gomb
```

**UI Elemek:**
- RadioGroup az opciókkal
- Opció leírások
- Élő szavazatszám (ha engedélyezett)

### 2.5 Beküldés

#### Anonim szavazás:
```typescript
POST /api/polls/[id]/vote-anonymous
```
**Payload:**
```json
{
  "optionId": "selected_option_id",
  "sessionId": "crypto.randomUUID()",
  "timeSpent": 45,
  "allowAnalytics": false
}
```

#### Regisztrált szavazás:
```typescript
POST /api/polls/[id]/vote
```
**Payload:**
```json
{
  "optionId": "selected_option_id", 
  "timeSpent": 45,
  "userData": { ... }
}
```

### 2.6 Eredmények

**Megjelenítés:**
- Szavazati eredmények grafikonokkal
- Százalékos megoszlás
- Felhasználó saját szavazatának kiemelése
- Összes leadott szavazat száma

---

## 📝 3. PETÍCIÓK - Felhasználói Folyamat

### 3.1 Kezdeti Betöltés

```
Felhasználó → /peticiok/[id] → Petíció adatok betöltése
```

**Megjelenített információk:**
- Petíció címe és leírása
- Jelenlegi aláírásszám
- Célkitűzés (targetGoal)
- Progress bar

### 3.2 Participation Choice

**KÜLÖNBSÉG:** Petícióknál **gombnyomásra** jelenik meg
```
"Aláírom a petíciót" gomb → Modal megnyitása → InteractiveParticipationFlow
```

**Technikai implementáció:**
```typescript
onClick={() => setShowInteractiveFlow(true)}
```

**Modal struktúra:**
```jsx
{showInteractiveFlow && (
  <div className="fixed inset-0 bg-black bg-opacity-50">
    <InteractiveParticipationFlow />
  </div>
)}
```

### 3.3 Autentikáció

**UGYANAZ**, mint kvízeknél és szavazásoknál:
- Google OAuth integration
- Automatikus adatok kitöltése

### 3.4 Aláírás Process

**MIKOR:** Participation choice és opcionális bejelentkezés után

**Form mezők automatikus kitöltése:**
```typescript
// Ha be van jelentkezve:
firstName: session.user?.name?.split(' ')[0]
lastName: session.user?.name?.split(' ').slice(1).join(' ')
email: session.user?.email
```

### 3.5 Beküldés

#### Anonim aláírás:
```typescript
POST /api/petitions/[id]/sign-anonymous
```

#### Regisztrált aláírás:
```typescript
POST /api/petitions/[id]/sign
```

### 3.6 Konfirmáció

**Email megerősítés:** (Regisztrált aláírásnál)
- Email küldése a megadott címre
- Verification link
- Aláírás aktiválása

**Sikeres visszajelzés:**
- Modal bezárása
- Success üzenet megjelenítése
- Aláírásszám frissítése

---

## 🔐 4. AUTENTIKÁCIÓ RÉSZLETEI

### 4.1 NextAuth Konfiguráció

**Provider:** Google OAuth 2.0
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
})
```

**Session Strategy:** Database
**Session MaxAge:** 24 óra

### 4.2 Szerepkör Management

**Admin felhasználók:**
```typescript
const adminEmails = [
  'admin@lovaszoltan.hu',
  'plscallmegiorgio@gmail.com'
]
```

**Szerepkörök:**
- `USER`: Alapértelmezett
- `ADMIN`: Adminisztrációs jogok

### 4.3 Session Információk

```typescript
session.user = {
  id: string,
  name: string,
  email: string, 
  role: 'USER' | 'ADMIN'
}
```

---

## 🛡️ 5. ADATVÉDELMI ASPEKTUSOK

### 5.1 Anonim Részvétel

**Tárolás:**
- `userId = null`
- `sessionId` azonosításhoz
- IP hash (analytics esetén)
- 30 napos automatikus törlés

### 5.2 Regisztrált Részvétel

**Tárolás:**
- `userId` linkelt
- Teljes adatok megőrzése
- GDPR compliance
- Törlés kérésre

### 5.3 Security Measures

**Rate Limiting:**
- API endpoint védelem
- IP-based korlátozások

**Input Validation:**
- Server-side validáció
- XSS védelem
- SQL injection védelem

---

## 📊 6. TECHNIKAI ARCHITEKTÚRA

### 6.1 State Management

```typescript
// Quiz/Poll pages
const [hasChosen, setHasChosen] = useState(false)
const [participationType, setParticipationType] = useState<'ANONYMOUS' | 'REGISTERED' | null>(null)
```

### 6.2 API Endpoints

```
Kvízek:
- GET /api/quizzes/[id]
- POST /api/quizzes/[id]/submit
- POST /api/quizzes/[id]/submit-anonymous

Szavazások:
- GET /api/polls/[id] 
- POST /api/polls/[id]/vote
- POST /api/polls/[id]/vote-anonymous

Petíciók:
- GET /api/petitions/[id]
- POST /api/petitions/[id]/sign
- POST /api/petitions/[id]/sign-anonymous
```

### 6.3 Database Models

**Közös mezők minden részvételi formánál:**
```typescript
{
  userId?: string,     // null = anonim
  sessionId?: string,  // anonim tracking
  ipAddress?: string,  // analytics
  userAgent?: string,  // analytics
  createdAt: DateTime
}
```

---

## 🎯 7. UX/UI KÖVETELMÉNYEK

### 7.1 Participation Choice Design

**Vizuális elemek:**
- 2 oszlopos layout (Anonim vs Regisztrált)
- Icon-ok minden opcióhoz
- Benefit listák
- Call-to-action gombok

### 7.2 Responsive Design

**Breakpointok:**
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### 7.3 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader támogatás
- Alt textok minden képhez

---

## ⚡ 8. TELJESÍTMÉNY OPTIMALIZÁCIÓ

### 8.1 Load Times

**Célkitűzések:**
- Initial load: < 2 másodperc
- API response: < 500ms
- Form submission: < 1 másodperc

### 8.2 Caching Strategy

**Client-side:**
- Session cache
- Theme cache
- API response cache

**Server-side:**
- Database query optimization
- CDN használat static assetek-hez

---

## 🔧 9. HIBAKEZELÉS

### 9.1 Network Errors

```typescript
try {
  const response = await fetch('/api/...')
  if (!response.ok) throw new Error(...)
} catch (error) {
  // User-friendly error message
  alert(error.message)
}
```

### 9.2 Validation Errors

**Client-side:**
- Real-time form validation
- Field-level error messages

**Server-side:**
- Input sanitization
- Business logic validation
- Proper HTTP status codes

---

## 📈 10. ANALYTICS ÉS MONITORING

### 10.1 User Behavior Tracking

**Esemény trackingek:**
- Participation choice kiválasztása
- Authentication success/failure  
- Form submission events
- Error occurrences

### 10.2 Performance Metrics

**Mérendő adatok:**
- Page load times
- API response times
- Conversion rates
- User abandonment points

---

Ezt a dokumentációt rendszeresen frissíteni kell a fejlesztések során, hogy mindig naprakész maradjon a jelenlegi implementációval.

**Utolsó frissítés:** 2025-09-19
**Verzió:** 1.0
**Szerző:** Claude Code