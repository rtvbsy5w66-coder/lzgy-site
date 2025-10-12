#!/bin/bash

# VERCEL INSTANT DEPLOY - GIT NÉLKÜL
# Használat: ./vercel-instant-deploy.sh

set -e

echo "🚀 VERCEL DEPLOYMENT - GIT NÉLKÜL"
echo "=================================="

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. TISZTÍTÁS
echo -e "${YELLOW}📦 Build artifactsok törlése...${NC}"
rm -rf .next
rm -rf .vercel
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Tisztítás kész${NC}"

# 2. ENVIRONMENT CHECK
echo -e "${YELLOW}🔍 Environment változók ellenőrzése...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ HIBA: .env.local nem található!${NC}"
    echo "Hozz létre egy .env.local fájlt a következő tartalommal:"
    echo ""
    echo "DATABASE_URL=your_database_url"
    echo "NEXTAUTH_SECRET=your_secret"
    echo "NEXTAUTH_URL=http://localhost:3000"
    exit 1
fi

# Ellenőrizzük a kritikus változókat
REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.local; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Hiányzó environment változók:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo -e "${GREEN}✅ Environment változók OK${NC}"

# 3. DEPENDENCIES
echo -e "${YELLOW}📚 Dependencies ellenőrzése...${NC}"
if [ ! -d "node_modules" ]; then
    echo "npm install futtatása..."
    npm install
fi
echo -e "${GREEN}✅ Dependencies OK${NC}"

# 4. VERCEL LOGIN CHECK
echo -e "${YELLOW}🔐 Vercel bejelentkezés ellenőrzése...${NC}"
if ! vercel whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Nem vagy bejelentkezve Vercel-be!${NC}"
    echo "Futtasd: vercel login"
    exit 1
fi
echo -e "${GREEN}✅ Vercel login OK${NC}"

# 5. GIT REQUIREMENTS ELTÁVOLÍTÁSA
echo -e "${YELLOW}🔧 Git ellenőrzés kikapcsolása...${NC}"

# .vercelignore létrehozása ha nincs
if [ ! -f .vercelignore ]; then
    cat > .vercelignore << 'EOF'
.git
.github
*.log
.env
.env.local
.env.*.local
node_modules
.next
.vercel
EOF
    echo -e "${GREEN}✅ .vercelignore létrehozva${NC}"
fi

# 6. VERCEL.JSON KONFIGURÁCIÓ
echo -e "${YELLOW}⚙️  Vercel konfiguráció...${NC}"
if [ ! -f vercel.json ]; then
    cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "git": {
    "deploymentEnabled": false
  }
}
EOF
    echo -e "${GREEN}✅ vercel.json létrehozva${NC}"
fi

# 7. DEPLOYMENT
echo -e "${YELLOW}🚀 Deployment indítása...${NC}"
echo ""
echo "Vercel deployment opciók:"
echo "1) Production deploy"
echo "2) Preview deploy"
read -p "Válassz (1/2): " choice

case $choice in
    1)
        echo -e "${YELLOW}Production deploymenthez használd a Vercel Dashboard-ot az env vars beállításához!${NC}"
        vercel --prod --yes --force
        ;;
    2)
        vercel --yes --force
        ;;
    *)
        echo -e "${RED}Érvénytelen választás${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ DEPLOYMENT KÉSZ!${NC}"
echo ""
echo "📋 KÖVETKEZŐ LÉPÉSEK:"
echo "1. Nyisd meg a Vercel Dashboard-ot: https://vercel.com/dashboard"
echo "2. Válaszd ki a projektet"
echo "3. Settings > Environment Variables"
echo "4. Add hozzá az environment változókat:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL (production URL-lel)"
echo "5. Redeploy a projektnek"
echo ""
echo "🔗 Project URL: https://vercel.com/dashboard"