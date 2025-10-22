# Security Headers Útmutató

## 📋 Implementált Security Headers

### 1. **Content-Security-Policy (CSP)**

**Mit csinál:** Megakadályozza a Cross-Site Scripting (XSS) támadásokat azáltal, hogy korlátozza, honnan töltődhetnek be erőforrások.

**Konfiguráció:**
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://vercel.live wss://ws-*.pusher.com https://*.upstash.io;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

**Védelem:**
- ✅ Csak megbízható forr ásokból töltődhet be script
- ✅ Megakadályozza inline script injection-t (kivéve engedélyezett)
- ✅ Automatikus HTTPS upgrade

---

### 2. **X-Frame-Options: DENY**

**Mit csinál:** Megakadályozza, hogy az oldal iframe-ben jelenjen meg (clickjacking védelem).

**Példa támadás:**
```html
<!-- evil.com -->
<iframe src="https://lovas-site.com/admin"></iframe>
<!-- Felhasználó azt hiszi, evil.com-on van, de valójában a Lovas oldalt látja -->
```

**Védelem:**
- ✅ Teljes clickjacking védelem
- ✅ Nem embedelhető más oldalakba

---

### 3. **X-Content-Type-Options: nosniff**

**Mit csinál:** Megakadályozza a böngészőt abban, hogy "kitalálja" a file típusát (MIME sniffing).

**Példa támadás:**
```
1. Feltöltünk egy image.png fájlt
2. De valójában ez JavaScript kód
3. Böngésző "kitalálja": ez JavaScript, futtassuk!
```

**Védelem:**
- ✅ Böngésző szigorúan a Content-Type header-t nézi
- ✅ Nem engedi futtatni .png-t JavaScript-ként

---

### 4. **Referrer-Policy: strict-origin-when-cross-origin**

**Mit csinál:** Kontrollálja, mennyi információt küld a Referer headerben.

**Beállítás:**
- Same-origin: teljes URL (https://lovas-site.com/admin/users)
- Cross-origin: csak origin (https://lovas-site.com)
- HTTPS → HTTP: nincs referrer

**Védelem:**
- ✅ Privát URL-ek (pl. /admin/user/123) nem szivárognak ki
- ✅ Analytics még működik (origin megvan)

---

### 5. **Permissions-Policy**

**Mit csinál:** Letiltja a böngésző API-kat (kamera, mikrofon, stb.).

**Konfiguráció:**
```
camera=(), microphone=(), geolocation=(), interest-cohort=()
```

**Védelem:**
- ✅ Politikai oldal nem kér kamera/mikrofon hozzáférést
- ✅ FLoC (Google tracking) letiltva
- ✅ Geolocation tracking letiltva

---

### 6. **Strict-Transport-Security (HSTS)** *(Production only)*

**Mit csinál:** Kényszeríti a HTTPS használatát 1 évig.

**Konfiguráció:**
```
max-age=31536000; includeSubDomains; preload
```

**Védelem:**
- ✅ Böngésző automatikusan HTTPS-re redirectel
- ✅ Man-in-the-middle attack védelem
- ✅ Preload: böngészők beépített HTTPS listája

---

### 7. **X-XSS-Protection: 1; mode=block**

**Mit csinál:** Legacy XSS védelem régi böngészőknek (Chrome, IE).

**Védelem:**
- ✅ Legacy böngésző támogatás
- ✅ CSP mellett extra védelem

---

### 8. **X-DNS-Prefetch-Control: on**

**Mit csinál:** Engedélyezi a DNS pre-fetching-et (gyorsabb betöltés).

**Előny:**
- ✅ Gyorsabb külső erőforrás betöltés
- ✅ Jobb UX

---

## 🧪 Tesztelés

### 1. SecurityHeaders.com Teszt

```bash
# Online teszt (production URL kell)
https://securityheaders.com/?q=https://your-domain.com

# Várható eredmény: A vagy A+
```

**Osztályzás:**
- A+: Minden header jelen van (tökéletes)
- A: Szinte minden jelen van
- B-F: Hiányoznak kritikus headerek

### 2. Mozilla Observatory

```bash
https://observatory.mozilla.org/analyze/your-domain.com

# Várható eredmény: B+ vagy A
```

### 3. Local Teszt (Development)

```bash
# Build és start
npm run build
npm start

# Headers ellenőrzése
curl -I http://localhost:3000 | grep -E "(Content-Security|X-Frame|X-Content|Referrer|Permissions|X-XSS)"

# Várható output:
# Content-Security-Policy: default-src 'self'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), ...
# X-XSS-Protection: 1; mode=block
```

### 4. Browser DevTools Teszt

```
1. Nyisd meg: Chrome DevTools → Network tab
2. Töltsd újra az oldalt
3. Kattints bármely request-re
4. Headers tab → Response Headers
5. Ellenőrizd, hogy minden security header jelen van
```

---

## 🔧 Finomhangolás

### CSP Hibák Debugolása

Ha a CSP blokkol valamit:

```
1. Chrome DevTools → Console
2. Látni fogod: "Refused to load ... because it violates the Content-Security-Policy"
3. Azonosítsd a forrást (pl. https://analytics.google.com)
4. Adj hozzá a CSP-hez:

// middleware.ts
const csp = [
  // ...
  "connect-src 'self' https://analytics.google.com", // ← Hozzáadva
  // ...
];
```

### Külső Script Hozzáadása

**Példa: Google Analytics**

```typescript
// middleware.ts
const csp = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com", // ← GA
  "connect-src 'self' https://www.google-analytics.com", // ← GA API
  // ...
];
```

**Példa: Facebook Pixel**

```typescript
const csp = [
  "script-src 'self' https://connect.facebook.net",
  "connect-src 'self' https://www.facebook.com",
  "img-src 'self' data: https: blob: https://www.facebook.com", // ← FB tracking pixel
  // ...
];
```

### `unsafe-inline` Eltávolítása (Ajánlott Production-hez)

**Jelenlegi (relaxed):**
```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

**Szigorú (production ready):**
```typescript
// 1. Minden inline script-et külső fájlba
// 2. Nonce használat:

const nonce = crypto.randomBytes(16).toString('base64');

const csp = [
  `script-src 'self' 'nonce-${nonce}'`, // ← Csak nonce-szal működik
];

// HTML-ben:
<script nonce="${nonce}">
  console.log('Only this script can run');
</script>
```

---

## ⚠️ Gyakori Problémák

### Probléma 1: CSP blokkolja a Vercel Analytics-et

**Megoldás:**
```typescript
const csp = [
  "script-src 'self' https://va.vercel-scripts.com", // ← Hozzáadva
  "connect-src 'self' https://vitals.vercel-insights.com", // ← Analytics API
];
```

### Probléma 2: Google Fonts nem töltődik be

**Megoldás:**
```typescript
const csp = [
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
];
```

### Probléma 3: Images nem töltődnek külső URL-ről

**Megoldás:**
```typescript
const csp = [
  "img-src 'self' data: https: blob:", // ← https: engedi az összeset
];
```

### Probléma 4: iframe beágyazás nem működik

**Megoldás:**
```typescript
// Ha szeretnéd engedélyezni iframe-et YouTube-ról:
const csp = [
  "frame-src https://www.youtube.com", // ← YouTube iframe
];

// ÉS módosítsd:
response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // DENY → SAMEORIGIN
```

---

## 📊 Benchmark

### Elvárható Eredmények

| Teszt | Minimális | Ideális |
|-------|-----------|---------|
| SecurityHeaders.com | A | A+ |
| Mozilla Observatory | B+ | A |
| HSTS Preload | - | ✅ Listed |
| CSP Violations | < 5/day | 0 |

---

## ✅ Production Checklist

- [ ] SecurityHeaders.com: **A vagy A+**
- [ ] Mozilla Observatory: **B+ vagy magasabb**
- [ ] CSP nem blokkol kritikus erőforrásokat
- [ ] HSTS enabled production-ben
- [ ] `unsafe-inline` eltávolítva production CSP-ből (opcionális)
- [ ] Minden külső script engedélyezve CSP-ben
- [ ] Browser console: nincs CSP violation
- [ ] Iframe embedding működik (ha kell)
- [ ] Analytics működik (GA, Vercel, stb.)

---

## 🔗 Hasznos Linkek

- **SecurityHeaders.com:** https://securityheaders.com/
- **Mozilla Observatory:** https://observatory.mozilla.org/
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com/
- **HSTS Preload:** https://hstspreload.org/
- **CSP Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html

---

**Utolsó frissítés:** 2025. Október 21.
**Státusz:** ✅ Security Headers ACTIVE

