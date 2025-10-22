# Google OAuth Beállítási Útmutató

## A PROBLÉMA
A Google bejelentkezés nem működik, mert a Google Cloud Console-ban **NINCSENEK BEÁLLÍTVA** a redirect URI-k.

## MEGOLDÁS - KÖVESD EZT A 5 LÉPÉST:

### 1. Menj a Google Cloud Console-ba
Nyisd meg: https://console.cloud.google.com/apis/credentials

### 2. Jelentkezz be
Ugyanazzal a Google fiókkal, amelyikkel létrehoztad a projektet.

### 3. Keresd meg az OAuth 2.0 Client ID-t
- Kattints a "Credentials" (Hitelesítő adatok) menüre
- Az "OAuth 2.0 Client IDs" szekció alatt keresd meg a saját OAuth Client ID-dat
- **KATTINTS RÁ** az edit (szerkesztés) ikonra (ceruza ikon)

### 4. Add hozzá a Redirect URI-ket
Az "Authorized redirect URIs" (Engedélyezett átirányítási URI-k) mezőben add hozzá **MINDKÉT** URI-t:

```
https://[YOUR_VERCEL_DOMAIN]/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**FONTOS:**
- Az első a PRODUCTION környezethez kell (Vercel)
- A második a LOCAL fejlesztéshez kell
- Minden URI külön sorban legyen!
- NE legyen szóköz az URI-k előtt/után!

### 5. Mentsd el a változtatásokat
- Kattints a "SAVE" (Mentés) gombra
- Várj 2-5 percet, amíg a változások érvénybe lépnek

---

## TESZT
Miután elmentetted:
1. Menj a production oldaladon a /login útvonalra
2. Kattints a "Bejelentkezés Google-lal" gombra
3. Válaszd ki a Google fiókodat
4. ✅ **SIKERES** ha átirányít a főoldalra
5. ❌ **HIBA** ha "redirect_uri_mismatch" vagy "OAuthCallback" hibát kapsz

---

## Ha még mindig nem működik:

### Ellenőrizd:
1. ✅ A redirect URI-k PONTOSAN egyeznek (vigyázz a typo-kra!)
2. ✅ Mentettél a Google Cloud Console-ban
3. ✅ Vártál 2-5 percet a változások érvénybe lépéséhez
4. ✅ Törölted a böngésző cookie-kat és újra próbáltad

### Debug információ:
```bash
Client ID: [YOUR_GOOGLE_CLIENT_ID]
Client Secret: [YOUR_GOOGLE_CLIENT_SECRET]

Required Redirect URIs:
- https://[YOUR_VERCEL_DOMAIN]/api/auth/callback/google
- http://localhost:3000/api/auth/callback/google
```

**Tipp:** Az aktuális Client ID és Secret megtalálható a `.env.local` fájlban a projektedben.

---

## Screenshot referencia
Ha nem találod, így néz ki a Google Cloud Console:

```
Google Cloud Console
└── APIs & Services
    └── Credentials
        └── OAuth 2.0 Client IDs
            └── [Client ID neve]
                └── Edit (ceruza ikon)
                    └── Authorized redirect URIs
                        ├── https://[YOUR_DOMAIN]/api/auth/callback/google
                        └── http://localhost:3000/api/auth/callback/google
```
