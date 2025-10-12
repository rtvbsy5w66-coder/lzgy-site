# Production Deployment Checklist

## ✅ Pre-Deployment Requirements:

### 1. Database Setup
- [ ] Production MySQL database created
- [ ] Database credentials configured in .env.production
- [ ] Database migration completed: `npx prisma db push`
- [ ] Database connection tested

### 2. Environment Configuration
- [ ] .env.production created with real values
- [ ] NEXTAUTH_SECRET generated (32+ characters)
- [ ] Google OAuth credentials configured
- [ ] Production domain set in NEXTAUTH_URL
- [ ] Admin email whitelist confirmed

### 3. Services Setup
- [ ] Resend account created for email
- [ ] Domain verified in Resend
- [ ] DNS records configured
- [ ] SSL certificate configured

### 4. Build & Test
- [ ] `npm run build` successful without database errors
- [ ] Admin login working with Google OAuth
- [ ] Email whitelist functioning
- [ ] All API endpoints responding

## 🚀 Deployment Commands:

```bash
# 1. Update production environment
cp .env.production .env

# 2. Install dependencies
npm ci --only=production

# 3. Generate Prisma client for production
npx prisma generate

# 4. Run database migration
npx prisma db push

# 5. Build application
npm run build

# 6. Start production server
npm start
```

## 🔍 Post-Deployment Verification:
- [ ] Website loads at production domain
- [ ] Admin login works with whitelisted emails
- [ ] Non-whitelisted emails are rejected
- [ ] Database connectivity working
- [ ] Email functionality working