# Google Login Teszt Útmutató

## 1️⃣ LOKÁLIS TESZT (http://localhost:3000)

A dev szerver már fut! Menj ide: **http://localhost:3000/login**

### Lépések:
1. Nyisd meg a böngésző **Developer Tools**-t (F12)
2. Menj a **Console** fülre
3. Kattints a "Bejelentkezés Google-lal" gombra
4. Figyeld mit ír ki a Console-ba!

### Mit várunk:
- ✅ **SIKERES**: Átirányít a Google login oldalra, majd vissza és be vagy jelentkezve
- ❌ **HIBA**: Hibaüzenetet látsz a Console-ban

---

## 2️⃣ PRODUCTION TESZT (Vercel)

Ha lokálisan működik, akkor a production-ön is működnie kell!

URL: https://lovas-political-site-ten.vercel.app/login

---

## 🔍 DEBUG - Ha nem működik

### Lehetséges problémák:

1. **"OAuthCallback" hiba**
   - ✅ MEGOLDVA: A redirect URIs már be vannak állítva
   - Várj 5 percet és próbáld újra

2. **"Configuration" hiba**
   - Probléma: GOOGLE_CLIENT_ID vagy GOOGLE_CLIENT_SECRET hiányzik
   - ✅ ELLENŐRIZVE: Mindkettő be van állítva

3. **Nincs semmi, csak "loading" majd semmi**
   - Probléma: A Google popup blokkolva van
   - Megoldás: Engedélyezd a popup-okat a böngészőben

4. **"Invalid request" a Google oldalon**
   - Probléma: A Client ID vagy Secret rossz
   - Ellenőrizd a Google Cloud Console-ban

---

## 📊 Jelenlegi Konfiguráció

✅ **Redirect URIs (Google Cloud Console)**:
- https://lovas-political-site-ten.vercel.app/api/auth/callback/google
- http://localhost:3000/api/auth/callback/google

✅ **Environment Variables**:
- `GOOGLE_CLIENT_ID`: 727149661577-uvsk279kg9e5srud099423mf56c0j6j1.apps.googleusercontent.com
- `GOOGLE_CLIENT_SECRET`: ✓ (titkosított)
- `NEXTAUTH_URL`: http://localhost:3000 (local) / https://lovas-political-site-ten.vercel.app (production)
- `NEXTAUTH_SECRET`: ✓ (titkosított)

✅ **NextAuth Pages**:
- Sign In: `/login`
- Error: `/login`

---

## 🚨 MOST MIT CSINÁLJ?

1. Menj ide: **http://localhost:3000/login**
2. Nyisd meg **F12 → Console**
3. Kattints **"Bejelentkezés Google-lal"**
4. **MÁSOLD IDE A CONSOLE OUTPUTOT** ha hiba van!
