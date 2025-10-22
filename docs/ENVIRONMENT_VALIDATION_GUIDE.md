# Environment Variables Validáció - Útmutató

## 📋 Miért Szükséges?

Az environment variables validáció **runtime-ban** ellenőrzi, hogy minden szükséges környezeti változó helyes formátumban van-e beállítva. Ez segít elkerülni:

- ❌ Runtime hibák production-ben hiányzó változók miatt
- ❌ Type-unsafe `process.env` hozzáférés
- ❌ Fejlesztői hibák (pl. helytelen URL formátum)
- ❌ Build időben felfedezetlen konfigurációs problémák

✅ **Megoldás:** Zod schema validation a `src/lib/env.ts` fájlban

---

## 🚀 Használat

### 1. Type-safe Environment Változó Hozzáférés

**❌ ROSSZ (unsafe):**
```typescript
const dbUrl = process.env.DATABASE_URL; // Type: string | undefined
```

**✅ JÓ (validated, type-safe):**
```typescript
import { env } from '@/lib/env';

const dbUrl = env.DATABASE_URL; // Type: string (validated)
```

### 2. Feature Flag Használat

```typescript
import { isFeatureEnabled } from '@/lib/env';

export default function NewsletterForm() {
  if (!isFeatureEnabled('NEWSLETTER')) {
    return <div>Newsletter funkció nem elérhető</div>;
  }

  return <NewsletterSignupForm />;
}
```

### 3. Environment Ellenőrzések

```typescript
import { isProduction, hasUpstashRedis, hasEmailService } from '@/lib/env';

if (isProduction() && !hasUpstashRedis()) {
  console.warn('⚠️ Upstash Redis not configured in production!');
}

if (hasEmailService()) {
  await sendEmailNotification(user);
} else {
  console.log('Email service not configured, skipping notification');
}
```

---

## 📁 Fájlstruktúra

```
├── .env.example         # Minden változó dokumentálva
├── .env.local           # Lokális dev környezet (git ignore!)
├── .env.production      # Production beállítások (Vercel/hosting provider)
└── src/lib/env.ts       # Zod validációs schema
```

---

## 🧪 Tesztelés

### 1. Helyes Konfiguráció Tesztelése

```bash
# Build elindítása validációval
npm run build

# Ha minden OK:
# ✅ Environment validation passed
# ✓ Compiled successfully

# Ha hiba van:
# ❌ Environment validation failed:
#   - NEXTAUTH_SECRET: NEXTAUTH_SECRET must be at least 32 characters long
#   - DATABASE_URL: DATABASE_URL must be a valid URL
```

### 2. Hiányzó Változó Tesztelése

```bash
# .env.local fájlban ideiglenesen töröld a DATABASE_URL-t
# DATABASE_URL="..." → # DATABASE_URL="..."

npm run dev

# Várható kimenet:
# ❌ Environment validation failed:
#   - DATABASE_URL: Required
```

### 3. Helytelen Formátum Tesztelése

```bash
# .env.local fájlban rosszul add meg az URL-t
DATABASE_URL="invalid-url-format"

npm run dev

# Várható kimenet:
# ❌ Environment validation failed:
#   - DATABASE_URL: DATABASE_URL must be a valid URL
```

---

## 🔧 Új Változó Hozzáadása

### 1. Lépések

1. **Adj hozzá a `.env.example` fájlhoz:**
```bash
# ==================== THIRD PARTY SERVICE ====================
THIRD_PARTY_API_KEY="your-api-key-here"
THIRD_PARTY_API_URL="https://api.thirdparty.com"
```

2. **Frissítsd a `src/lib/env.ts` sémát:**
```typescript
const envSchema = z.object({
  // ... existing vars

  // ==================== Third Party Service ====================
  THIRD_PARTY_API_KEY: z.string().min(10, 'API key must be at least 10 characters'),
  THIRD_PARTY_API_URL: z.string().url('Must be a valid URL'),
});
```

3. **Add hozzá a saját `.env.local` fájlhoz:**
```bash
THIRD_PARTY_API_KEY="sk_test_1234567890"
THIRD_PARTY_API_URL="https://api.thirdparty.com"
```

4. **Használd type-safe módon:**
```typescript
import { env } from '@/lib/env';

const response = await fetch(env.THIRD_PARTY_API_URL, {
  headers: {
    'Authorization': `Bearer ${env.THIRD_PARTY_API_KEY}`,
  },
});
```

---

## ⚙️ Schema Típusok

### String Validáció

```typescript
// Egyszerű string
API_KEY: z.string(),

// Minimum hossz
PASSWORD: z.string().min(8, 'Password must be at least 8 characters'),

// Email
ADMIN_EMAIL: z.string().email('Must be a valid email'),

// URL
API_URL: z.string().url('Must be a valid URL'),

// Opcionális
OPTIONAL_KEY: z.string().optional(),
```

### Enum Validáció

```typescript
// Csak megadott értékek
NODE_ENV: z.enum(['development', 'production', 'test']),

// Default értékkel
LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
```

### Boolean Validáció

```typescript
// String → Boolean transform
ENABLE_FEATURE: z
  .string()
  .optional()
  .default('false')
  .transform((val) => val === 'true'),
```

### Number Validáció

```typescript
// String → Number transform
PORT: z
  .string()
  .optional()
  .default('3000')
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().min(1000).max(65535)),

MAX_UPLOAD_SIZE: z
  .string()
  .optional()
  .default('5242880') // 5MB
  .transform((val) => parseInt(val, 10)),
```

---

## 🛡️ Production-Specific Validations

Az `env.ts` fájlban már implementálva vannak production ellenőrzések:

```typescript
const envSchemaRefined = envSchema.refine(
  (data) => {
    if (data.NODE_ENV === 'production') {
      // Upstash Redis warning production-ben
      if (!data.UPSTASH_REDIS_REST_URL || !data.UPSTASH_REDIS_REST_TOKEN) {
        console.warn(
          '[ENV] WARNING: UPSTASH_REDIS not configured in production. ' +
          'Using in-memory rate limiter (not recommended for load-balanced environments).'
        );
      }

      // Email service warning production-ben
      if (!data.RESEND_API_KEY || !data.RESEND_FROM_EMAIL) {
        console.warn(
          '[ENV] WARNING: RESEND email not configured in production. ' +
          'Email features will be disabled.'
        );
      }
    }

    return true;
  }
);
```

---

## 📊 Validált Változók Listája

### ✅ KÖTELEZŐ (minden környezetben)

| Változó | Típus | Validáció | Leírás |
|---------|-------|-----------|---------|
| `DATABASE_URL` | string | Valid URL | MySQL/PostgreSQL connection string |
| `NEXTAUTH_SECRET` | string | Min 32 char | NextAuth session encryption key |
| `NEXTAUTH_URL` | string | Valid URL | Application base URL |
| `CSRF_SECRET` | string | Min 32 char | CSRF token encryption key |

### ⚠️ AJÁNLOTT (production)

| Változó | Típus | Validáció | Leírás |
|---------|-------|-----------|---------|
| `UPSTASH_REDIS_REST_URL` | string | Valid URL | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | string | - | Upstash Redis token |
| `RESEND_API_KEY` | string | - | Resend email API key |
| `RESEND_FROM_EMAIL` | string | Valid email | Verified sender email |

### 🔧 OPCIONÁLIS

| Változó | Típus | Default | Leírás |
|---------|-------|---------|---------|
| `NODE_ENV` | enum | `development` | Runtime environment |
| `ENABLE_NEWSLETTER` | boolean | `false` | Newsletter feature flag |
| `ENABLE_PETITIONS` | boolean | `true` | Petition feature flag |
| `NEXT_PUBLIC_SENTRY_DSN` | string | - | Sentry error tracking DSN |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | string | - | Google Analytics ID |

---

## 🐛 Troubleshooting

### Probléma: "Environment validation failed" Build Időben

**Megoldás:**
1. Nézd meg a részletes hibaüzenetet:
```
❌ Environment validation failed:
  - DATABASE_URL: DATABASE_URL must be a valid URL
  - NEXTAUTH_SECRET: NEXTAUTH_SECRET must be at least 32 characters long
```

2. Ellenőrizd a `.env.local` fájlt
3. Javítsd a hibás változókat
4. Build újra

### Probléma: Production Deploy Fail

**Okok:**
- Vercel/Hosting provider-nél nincs beállítva az env változó
- Helytelen formátum (pl. URL without protocol)

**Megoldás:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Másold be az összes KÖTELEZŐ változót
3. Redeploy

### Probléma: Warning Production-ben

```
[ENV] WARNING: UPSTASH_REDIS not configured in production.
```

**Nem blocking hiba**, de production-ben ajánlott beállítani:
- Upstash Redis: [Setup Guide](./UPSTASH_SETUP.md)
- Resend Email: [Resend Dashboard](https://resend.com/dashboard)

---

## ✅ Checklist

### Development

- [ ] `.env.local` létrehozva (alapja: `.env.example`)
- [ ] Minden KÖTELEZŐ változó beállítva
- [ ] `npm run dev` hiba nélkül indul
- [ ] `import { env } from '@/lib/env'` működik

### Production

- [ ] Hosting provider-nél env változók beállítva
- [ ] Build sikeres (`npm run build`)
- [ ] UPSTASH_REDIS konfigurálva (ajánlott)
- [ ] RESEND email konfigurálva (ajánlott)
- [ ] SENTRY error tracking konfigurálva (opcionális)

---

## 📚 További Olvasnivaló

- **Zod Documentation:** https://zod.dev
- **Next.js Environment Variables:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

**Utolsó frissítés:** 2025. Október 21.
**Státusz:** ✅ Environment Validation ACTIVE (Zod)
