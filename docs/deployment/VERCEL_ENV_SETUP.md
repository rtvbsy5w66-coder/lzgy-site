# 🚀 Vercel Environment Variables Setup

## Passwordless Authentication Requirements

A passwordless authentication (email code login) működéséhez **add hozzá ezeket a Vercel Environment Variables-hez**:

### 📧 Email Service (Gmail SMTP - AJÁNLOTT)

```bash
# Gmail SMTP Configuration
GMAIL_USER="plscallmegiorgio@gmail.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"  # A te Gmail App Password-öd
```

**VAGY alternatívaként:**

### 📧 Email Service (Resend - Ha van verifikált domain)

```bash
# Resend Configuration
RESEND_API_KEY="re_UwjL5C5p_MnCi1nqtdNfrCfPSceHNCGt8"  # Már létező
EMAIL_FROM_DOMAIN="dev@lovaszoltan.hu"                 # Már létező
```

**FONTOS:** Ha Resend-et használsz production-ben, **verifikálnod kell** a `lovaszoltan.dev` domaint a Resend dashboard-on:
- https://resend.com/domains
- Add hozzá a DNS rekordokat (SPF, DKIM, DMARC)

---

## 🔧 Vercel Dashboard Lépések

1. **Menj a Vercel Dashboard-ra**: https://vercel.com/dashboard
2. **Válaszd ki a projektet**: `lovas-political-site`
3. **Settings** → **Environment Variables**
4. **Add meg ezeket a változókat:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GMAIL_USER` | `plscallmegiorgio@gmail.com` | Production, Preview |
| `GMAIL_APP_PASSWORD` | `abcd efgh ijkl mnop` | Production, Preview |

5. **Kattints:** "Save"
6. **Redeploy** az alkalmazást hogy az új env változók érvényesüljenek

---

## ✅ TESZTELD PRODUCTION-BEN

Deployment után:

1. Menj a production URL-re: `https://your-domain.com/login`
2. Kattints: `🔐 Email Kód (Ajánlott)`
3. Írj be egy email címet
4. Kattints: "Kód küldése"
5. Ellenőrizd az emailedet
6. Írd be a 6-jegyű kódot
7. **Sikeres bejelentkezés!** ✅

---

## 🔒 Biztonsági Megjegyzések

- ✅ **Gmail App Password**: Biztonságos, Google által menedzselt
- ✅ **Rate Limiting**: 3 kód / 5 perc / email cím
- ✅ **Code Expiry**: 5 perc lejárati idő
- ✅ **One-Time Use**: Kód csak egyszer használható
- ✅ **Database**: Neon PostgreSQL (már be van állítva Vercel-en)

---

## 📊 Email Service Összehasonlítás

| Feature | Gmail SMTP | Resend (sandbox) | Resend (verified domain) |
|---------|------------|------------------|--------------------------|
| **Setup idő** | 5 perc | 0 perc | 15 perc + DNS |
| **Működik bárkinek?** | ✅ Igen | ❌ Csak saját email | ✅ Igen |
| **Ingyenes limit** | ~500/nap | - | 3000/hó |
| **Domain verifikáció** | ❌ Nem kell | ❌ Nem kell | ✅ Szükséges |
| **Production ready** | ✅ Igen | ❌ Nem | ✅ Igen |

**AJÁNLÁS PRODUCTION-RE**: Használd a **Gmail SMTP**-t (már be van állítva az `.env.local`-ban!)

---

## 🎯 GYORS ÖSSZEFOGLALÓ

**MI MŰKÖDIK MOST:**
- ✅ Passwordless authentication lokálisan (Gmail SMTP)
- ✅ Production build sikeres
- ✅ TypeScript hibák javítva
- ✅ ESLint warning-ok fixálva

**MIT KELL CSINÁLNI VERCEL-EN:**
1. Adj hozzá 2 environment variable-t: `GMAIL_USER` + `GMAIL_APP_PASSWORD`
2. Redeploy az app-ot
3. **KÉSZ!** Működik production-ben is! 🚀

**VAGY ALTERNATÍVAKÉNT:**
1. Verifikáld a `lovaszoltan.dev` domaint a Resend-en
2. Használd a már létező `RESEND_API_KEY`-t
3. **KÉSZ!** Működik production-ben is! 🚀
