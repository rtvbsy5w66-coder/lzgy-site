# 🚀 Vercel Deployment Guide

## 1. Vercel Dashboard Setup

1. Menj a [Vercel Dashboard](https://vercel.com/dashboard)
2. Kattints az **"Import Project"** gombra
3. Importáld a GitHub repository-t: `lovas-political-site`
4. Válaszd a **main-for-vercel** branch-et

## 2. Environment Variables

A Vercel Dashboard-ban, a projekt Settings > Environment Variables részében add hozzá ezeket:

### 🔑 Production Environment Variables

```env
# Database (Váltsd át production MySQL-re)
DATABASE_URL=mysql://username:password@your-mysql-host:3306/database_name

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key-here

# Google OAuth (Valódi Google Cloud Console credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Email Whitelist
ADMIN_EMAILS=lovas.zoltan@mindenkimagyarorszaga.hu,admin@lovaszoltan.hu

# Email Configuration (Resend)
RESEND_API_KEY=re_your_actual_resend_api_key
EMAIL_FROM_DOMAIN=noreply@lovaszoltan.hu
ADMIN_EMAIL=admin@lovaszoltan.hu

# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app

# Security
CSRF_SECRET=your-csrf-secret-here
INTERNAL_API_KEY=TDVdEUEziKyz/X8KOgVrE+QdLNJ5vGCOC8rW3jI8R6w=
ENCRYPTION_KEY=LwIRMDsukxDzuD8yBE/gHxkQ2n9J6rT3V8wN1cP4L5s=

# Newsletter Scheduler
NEXT_PUBLIC_SCHEDULER_KEY=newsletter-scheduler-secret-key-2024
SCHEDULER_API_KEY=newsletter-scheduler-secret-key-2024

# Build Configuration
SKIP_ENV_VALIDATION=true
```

## 3. Database Setup

### MySQL Database Requirement

A projekt **MySQL adatbázist igényel**. Opciók:

1. **PlanetScale** (Ajánlott)
   - Ingyenes MySQL-compatible adatbázis
   - Automatikus connection pooling
   - URL formátum: `mysql://username:password@host.connect.psdb.cloud/database?sslaccept=strict`

2. **Railway MySQL**
   - Egyszerű setup
   - URL formátum: `mysql://username:password@railway.mysql.host:3306/database`

3. **AWS RDS MySQL**
   - Enterprise szintű megoldás

### Adatbázis Inicializálás

```bash
# Lokálisan, a production adatbázis URL-lel:
npx prisma db push
npx prisma db seed
```

## 4. Domain Configuration

1. Vercel Dashboard > Domains
2. Add hozzá a custom domain-t: `lovaszoltan.hu`
3. Frissítsd a DNS rekordokat
4. Frissítsd az environment variable-okat az új domain-nel

## 5. Google OAuth Setup

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
3. Authorized JavaScript origins:
   ```
   https://your-domain.vercel.app
   ```

## 6. Deployment Commands

```bash
# 1. Push a main-for-vercel branch
git add .
git commit -m "feat: configure for Vercel deployment"
git push origin main-for-vercel

# 2. Vercel automatikusan deploy-olja
```

## 7. Post-Deployment Testing

### API Endpoints Check:
```bash
curl https://your-domain.vercel.app/api/posts
curl https://your-domain.vercel.app/api/events  
curl https://your-domain.vercel.app/api/admin/analytics
```

### Admin Login Test:
1. Menj a `https://your-domain.vercel.app/admin/login`
2. Használd a Google OAuth-ot a whitelisted email-lel

## 8. Netlify Frontend Update

Miután a Vercel API működik, frissítsd a Netlify frontend-et:

```env
# Netlify Environment Variables
NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_BASE_URL=https://your-netlify-domain.netlify.app
```

---

## ⚠️ Biztonsági Figyelmeztetések

1. **SOHA ne commitálj valódi API kulcsokat a git-be**
2. **Google OAuth credentials-eket production-ra cseréld**
3. **MySQL password legyen erős és egyedi**
4. **ADMIN_EMAILS whitelist kritikus biztonsági beállítás**

---

## 🎯 Success Criteria

- ✅ Vercel deployment működik
- ✅ API endpoints válaszolnak 
- ✅ Google OAuth admin login működik
- ✅ Database connection sikeres
- ✅ Newsletter scheduler aktív
- ✅ Netlify frontend csatlakozik a Vercel API-hoz