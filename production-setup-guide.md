# Production Setup Guide v1.0

**lovas-political-site** - Quick Production Deployment Guide

---

## 🚀 **Quick Start**

### **1. Clone and Checkout**
```bash
git clone https://github.com/footballinvestment/lovas-political-site.git
cd lovas-political-site
git checkout v1.0.0
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Configuration**
```bash
# Copy production environment template
cp .env.production.example .env.production

# Configure required variables (see Configuration section below)
nano .env.production
```

### **4. Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database (optional)
npm run seed
```

### **5. Build and Start**
```bash
# Production build
npm run build

# Start production server
npm start
```

### **6. Health Check**
```bash
# Verify deployment
curl -f http://localhost:3000/api/health
# Expected: {"status": "healthy", "timestamp": "2024-09-18T..."}
```

---

## ⚙️ **Configuration**

### **Required Environment Variables**

```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com

# Database (MySQL)
DATABASE_URL="mysql://username:password@host:3306/database_name"

# Authentication
NEXTAUTH_SECRET="your-32-character-secret-here"
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD_HASH="$2b$12$your-bcrypt-hash-here"

# Email Service (Resend)
RESEND_API_KEY="re_YourResendAPIKey_here"
EMAIL_FROM="noreply@your-domain.com"
EMAIL_FROM_DOMAIN="your-domain.com"

# Security
JWT_SECRET="your-jwt-secret-32-characters-min"
ENCRYPTION_KEY="your-encryption-key-32-chars"
```

### **Optional Configuration**
```bash
# Feature Flags
FEATURE_NEWSLETTER=false
FEATURE_COMMENTS=false
FEATURE_MAINTENANCE_MODE=false
FEATURE_ERROR_EMAILS=true

# Performance
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account"
```

---

## 🔐 **Security Setup**

### **1. Generate Secrets**
```bash
# NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# JWT_SECRET (32+ characters)  
openssl rand -hex 32

# ENCRYPTION_KEY (32 characters exactly)
openssl rand -hex 16
```

### **2. Admin Password Hash**
```bash
# Generate bcrypt hash for admin password
node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-admin-password', 12);
console.log('ADMIN_PASSWORD_HASH=' + hash);
"
```

### **3. Database Security**
- Use strong database passwords
- Enable SSL connections if available
- Restrict database access to application IPs only
- Regularly backup database

---

## 🗄️ **Database Setup**

### **MySQL Configuration**
```sql
-- Create database
CREATE DATABASE lovas_political CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace with strong password)
CREATE USER 'lovas_user'@'%' IDENTIFIED BY 'strong-password-here';
GRANT ALL PRIVILEGES ON lovas_political.* TO 'lovas_user'@'%';
FLUSH PRIVILEGES;
```

### **Connection String Format**
```bash
DATABASE_URL="mysql://username:password@host:3306/database_name"

# Example with SSL
DATABASE_URL="mysql://user:pass@host:3306/db?sslaccept=strict"
```

---

## 📧 **Email Configuration**

### **Resend Setup**
1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Verify your sending domain
4. Update environment variables:

```bash
RESEND_API_KEY="re_YourAPIKey_here"
EMAIL_FROM="noreply@your-verified-domain.com"
EMAIL_FROM_DOMAIN="your-verified-domain.com"
```

---

## 🏗️ **Deployment Platforms**

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# Add database URL and all required environment variables
```

### **AWS/VPS Deployment**
```bash
# Install PM2 for process management
npm install pm2 -g

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'lovas-political-site',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Docker Deployment**
```dockerfile
# Dockerfile (create if needed)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t lovas-political-site .
docker run -p 3000:3000 --env-file .env.production lovas-political-site
```

---

## 🔍 **Validation & Testing**

### **Build Validation**
```bash
# Validate environment
npm run validate:env

# Build test
npm run build

# Test suite
npm test

# Health check
npm run health:check
```

### **API Endpoints Test**
```bash
# Core API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/posts
curl http://localhost:3000/api/events
curl http://localhost:3000/api/messages
```

### **Frontend Pages Test**
- Homepage: `/`
- Admin Login: `/admin/login`
- News: `/hirek`
- Events: `/esemenyek`
- Contact: `/kapcsolat`

---

## 📊 **Monitoring**

### **Health Endpoints**
```bash
# Application health
GET /api/health
# Returns: {"status": "healthy", "timestamp": "..."}

# Database connectivity
GET /api/ready  
# Returns: {"status": "ready", "database": "connected"}
```

### **Log Monitoring**
```bash
# Production logs (PM2)
pm2 logs lovas-political-site

# Application logs
tail -f logs/application.log

# Error tracking
tail -f logs/error.log
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection:**
```bash
# Test database connection
npm run test:db

# Check database URL format
echo $DATABASE_URL
```

**Environment Variables:**
```bash
# Validate all required variables
npm run validate:env

# Check specific variable
echo $NEXTAUTH_SECRET
```

**Port Issues:**
```bash
# Check port availability
lsof -i :3000

# Use different port
PORT=3001 npm start
```

---

## 📞 **Support**

### **Documentation References**
- **API Usage**: `API_CLIENT_USAGE.md`
- **Architecture**: `ARCHITECTURAL_DECISION_RECORD.md`
- **Complete Guide**: `HANDOFF_FINAL.md`
- **Release Notes**: `RELEASE_NOTES_v1.0.md`

### **Getting Help**
- **Issues**: https://github.com/footballinvestment/lovas-political-site/issues
- **Discussions**: Repository discussions tab
- **Documentation**: See included guides in repository

---

## ✅ **Production Checklist**

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] SSL certificates installed
- [ ] Domain pointing configured
- [ ] Email sending verified
- [ ] Health endpoints responding
- [ ] Admin access confirmed
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Error tracking set up

---

**🎯 Your lovas-political-site v1.0.0 is now ready for production!**

*Last updated: September 18, 2024*