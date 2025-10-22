# 🚀 TELJES VERCEL DEPLOYMENT TERV - lzgy.hu

## 📋 ÁTTEKINTÉS

**Cél:** Minden service (frontend, backend, API, database) egy Vercel projekten belül, custom domain: **lzgy.hu**

## 🏗️ ARCHITEKTÚRA

```
lzgy.hu (Vercel)
├── Frontend (Next.js SSR)
├── API Routes (/api/*)
├── Database (PlanetScale MySQL)
├── AI Service (OpenAI/Anthropic API)
└── Static Assets
```

## 📝 IMPLEMENTÁCIÓS LÉPÉSEK

### FÁZIS 1: VERCEL PROJEKT SETUP

#### 1.1 Új Vercel Projekt Létrehozása
```bash
# 1. Vercel Dashboard
- New Project
- Import: lovas-political-site-final
- Branch: main
- Project Name: lzgy-political-site
```

#### 1.2 Build Konfiguráció
```json
// vercel.json
{
  "buildCommand": "prisma generate && npm run build",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

#### 1.3 Package.json Optimalizálás
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "vercel-build": "prisma generate && next build"
  }
}
```

### FÁZIS 2: DATABASE MIGRÁCIÓ

#### 2.1 PlanetScale Setup
```bash
# PlanetScale account létrehozása
# Új database: lovas-political-prod
# Connection string generálás
```

#### 2.2 Schema Migráció
```bash
# Lokális adatok backup
mysqldump -u lovasadmin -p lovas_political > backup.sql

# PlanetScale kapcsolat tesztelése
npx prisma db push --preview-feature

# Seed data feltöltése
npx prisma db seed
```

#### 2.3 Environment Variables - Database
```env
# Vercel Dashboard > Settings > Environment Variables
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/lovas-political-prod?sslaccept=strict"
```

### FÁZIS 3: AI SERVICE MIGRÁCIÓ

#### 3.1 OpenAI API Integráció (Ollama helyett)
```typescript
// src/lib/ai-client.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });
  
  return response.choices[0].message.content;
}
```

#### 3.2 AI Environment Variables
```env
# Vercel Environment Variables
OPENAI_API_KEY="sk-your-openai-api-key"
AI_ENABLED=true
AI_PROVIDER=openai
AI_MODEL=gpt-3.5-turbo
```

#### 3.3 AI API Route Update
```typescript
// src/app/api/ai/chat/route.ts
import { generateAIResponse } from '@/lib/ai-client';

export async function POST(request: Request) {
  const { message } = await request.json();
  
  try {
    const response = await generateAIResponse(message);
    return Response.json({ response });
  } catch (error) {
    return Response.json({ error: 'AI service unavailable' }, { status: 500 });
  }
}
```

### FÁZIS 4: COMPLETE ENVIRONMENT VARIABLES

```env
# Production Environment Variables for Vercel

# Database
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/lovas-political-prod?sslaccept=strict"

# NextAuth
NEXTAUTH_URL="https://lzgy.hu"
NEXTAUTH_SECRET="production-secret-32-characters-minimum-random"

# Google OAuth (Production)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"

# Email (Resend Production)
RESEND_API_KEY="re_your_production_resend_api_key"
EMAIL_FROM_DOMAIN="noreply@lzgy.hu"
ADMIN_EMAIL="admin@lzgy.hu"

# AI Service
OPENAI_API_KEY="sk-your-openai-api-key"
AI_ENABLED=true
AI_PROVIDER=openai

# Security
CSRF_SECRET="production-csrf-secret-32-characters"
INTERNAL_API_KEY="production-internal-api-key"
ENCRYPTION_KEY="production-encryption-key-32-chars"

# Admin
ADMIN_EMAILS="lovas.zoltan@mindenkimagyarorszaga.hu,admin@lzgy.hu"

# Application
NEXT_PUBLIC_BASE_URL="https://lzgy.hu"
NEXT_PUBLIC_SCHEDULER_KEY="production-scheduler-key"

# Build
SKIP_ENV_VALIDATION=false
NODE_ENV=production
```

### FÁZIS 5: DOMAIN KONFIGURÁCIÓ

#### 5.1 DNS Beállítások (lzgy.hu domain provider-nél)
```dns
# A Record
@ -> 76.76.19.61 (Vercel IP)

# CNAME Record  
www -> cname.vercel-dns.com

# MX Records (Email-hez, ha kell)
@ -> 10 mx1.your-email-provider.com
@ -> 20 mx2.your-email-provider.com
```

#### 5.2 Vercel Domain Setup
```bash
# Vercel Dashboard Steps:
1. Project Settings > Domains
2. Add Domain: lzgy.hu
3. Add Domain: www.lzgy.hu  
4. Várj a DNS propagációra (24 óra)
```

#### 5.3 SSL Automatikus
```bash
# Vercel automatikusan generál Let's Encrypt SSL-t
# Nincs további teendő
```

### FÁZIS 6: GOOGLE OAUTH PRODUCTION SETUP

#### 6.1 Google Cloud Console
```bash
# https://console.cloud.google.com/apis/credentials
# OAuth 2.0 Client IDs > Edit

# Authorized JavaScript origins:
https://lzgy.hu
https://www.lzgy.hu

# Authorized redirect URIs:
https://lzgy.hu/api/auth/callback/google
https://www.lzgy.hu/api/auth/callback/google
```

#### 6.2 Google Verification (SEO)
```env
# Vercel Environment Variables
GOOGLE_VERIFICATION="your-google-search-console-code"
```

### FÁZIS 7: EMAIL KONFIGURÁCIÓ

#### 7.1 Resend Domain Setup
```bash
# Resend Dashboard
# Add Domain: lzgy.hu
# DNS Records hozzáadása:

# TXT Record
_resend -> "resend_domain_verification_code"

# MX Records
@ -> 10 inbound.resend.com
```

#### 7.2 Email Templates Production
```typescript
// src/lib/email-templates.ts
export const PRODUCTION_EMAIL_CONFIG = {
  from: 'noreply@lzgy.hu',
  replyTo: 'admin@lzgy.hu',
  domain: 'lzgy.hu'
};
```

### FÁZIS 8: PERFORMANCE OPTIMALIZATION

#### 8.1 Next.js Optimalizáció
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['lzgy.hu'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};
```

#### 8.2 Vercel Analytics
```env
# Vercel Dashboard > Analytics
# Enable Web Analytics
# Enable Speed Insights
```

### FÁZIS 9: BIZTONSÁGI BEÁLLÍTÁSOK

#### 9.1 Security Headers
```json
// vercel.json headers
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

#### 9.2 Rate Limiting Production
```typescript
// src/middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### FÁZIS 10: MONITORING & BACKUP

#### 10.1 Vercel Monitoring
```bash
# Functions Monitoring
# Real-time logs
# Performance metrics
# Error tracking
```

#### 10.2 Database Backup Strategy
```bash
# PlanetScale automatic backups
# Daily snapshots
# Point-in-time recovery
```

## 🕐 TIMELINE

**Hét 1:** Fázis 1-3 (Vercel + Database)
**Hét 2:** Fázis 4-6 (Config + Domain) 
**Hét 3:** Fázis 7-9 (Email + Performance + Security)
**Hét 4:** Fázis 10 + Testing + Launch

## ✅ SUCCESS METRICS

- [ ] lzgy.hu betöltődik < 2 másodperc
- [ ] API endpoints válaszolnak
- [ ] Google OAuth működik
- [ ] Admin dashboard elérhető
- [ ] Email küldés működik
- [ ] AI chat válaszol
- [ ] Mobile responsive
- [ ] SSL A+ rating
- [ ] 99.9% uptime

## 🚨 ROLLBACK TERV

Ha bármi elromlik:
1. DNS visszaállítása Netlify-ra
2. Database backup visszaállítása
3. Environment variables backup
4. Git revert specific commits

---

**ELSŐ LÉPÉS: PlanetScale account és Vercel projekt létrehozása!**