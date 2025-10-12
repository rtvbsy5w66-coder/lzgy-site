#!/bin/bash

# SECRETS SCANNER - Megtalálja a hardcoded secreteket
# Használat: ./check-secrets.sh

echo "🔍 SECRETS KERESÉSE A KÓDBAN"
echo "============================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FOUND_SECRETS=0

# 1. API KULCSOK
echo -e "${YELLOW}Keresés: API kulcsok...${NC}"
if grep -r -i --exclude-dir={node_modules,.next,.git,build,dist} -E "(api[_-]?key|apikey)\s*=\s*['\"][a-zA-Z0-9]{20,}" .; then
    echo -e "${RED}❌ API kulcsok találva!${NC}"
    FOUND_SECRETS=1
fi

# 2. PASSWORDS
echo -e "${YELLOW}Keresés: Jelszavak...${NC}"
if grep -r -i --exclude-dir={node_modules,.next,.git,build,dist} -E "(password|passwd|pwd)\s*=\s*['\"][^'\"]{3,}" . | grep -v "process.env" | grep -v "TODO" | grep -v "example"; then
    echo -e "${RED}❌ Jelszavak találva!${NC}"
    FOUND_SECRETS=1
fi

# 3. DATABASE URLs
echo -e "${YELLOW}Keresés: Database URLs...${NC}"
if grep -r -i --exclude-dir={node_modules,.next,.git,build,dist} -E "(postgres|mysql|mongodb)://[^'\" ]+" . | grep -v "process.env" | grep -v "example" | grep -v ".md"; then
    echo -e "${RED}❌ Database URLs találva!${NC}"
    FOUND_SECRETS=1
fi

# 4. JWT/SECRET KEYS
echo -e "${YELLOW}Keresés: Secret keys...${NC}"
if grep -r -i --exclude-dir={node_modules,.next,.git,build,dist} -E "(secret|jwt[_-]?secret|nextauth[_-]?secret)\s*=\s*['\"][a-zA-Z0-9]{20,}" . | grep -v "process.env"; then
    echo -e "${RED}❌ Secret keys találva!${NC}"
    FOUND_SECRETS=1
fi

# 5. PRIVATE KEYS
echo -e "${YELLOW}Keresés: Private keys...${NC}"
if grep -r --exclude-dir={node_modules,.next,.git,build,dist} "BEGIN.*PRIVATE KEY" .; then
    echo -e "${RED}❌ Private keys találva!${NC}"
    FOUND_SECRETS=1
fi

# 6. AWS CREDENTIALS
echo -e "${YELLOW}Keresés: AWS credentials...${NC}"
if grep -r -i --exclude-dir={node_modules,.next,.git,build,dist} -E "AKIA[0-9A-Z]{16}" .; then
    echo -e "${RED}❌ AWS credentials találva!${NC}"
    FOUND_SECRETS=1
fi

# 7. .env FÁJLOK ELLENŐRZÉSE
echo -e "${YELLOW}Keresés: .env fájlok a git-ben...${NC}"
if [ -d .git ]; then
    if git ls-files | grep -E "\.env(\.local|\.production)?$"; then
        echo -e "${RED}❌ .env fájlok a git-ben!${NC}"
        FOUND_SECRETS=1
    fi
fi

# 8. HARDCODED IPs és DOMAINS
echo -e "${YELLOW}Keresés: Hardcoded production URLs...${NC}"
if grep -r --exclude-dir={node_modules,.next,.git,build,dist} -E "https?://[a-zA-Z0-9.-]+\.(com|net|org|io)" . | grep -v "process.env" | grep -v "example.com" | grep -v "localhost" | grep -v ".md" | grep -v "vercel.app"; then
    echo -e "${YELLOW}⚠️  Production URLs találva (ellenőrizd hogy environment változó-e!)${NC}"
fi

echo ""
echo "================================"
if [ $FOUND_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ NINCS HARDCODED SECRET!${NC}"
    echo ""
    echo "Következő lépések:"
    echo "1. Másold át .env.local.template -> .env.local"
    echo "2. Töltsd ki az értékeket"
    echo "3. Futtasd: ./vercel-instant-deploy.sh"
    exit 0
else
    echo -e "${RED}❌ SECRETEK TALÁLVA!${NC}"
    echo ""
    echo "MIT KELL TENNI:"
    echo "1. Cseréld ki a hardcoded értékeket process.env.VARIABLE_NAME-re"
    echo "2. Add hozzá a változókat .env.local-hoz"
    echo "3. Futtasd újra ezt a scriptet"
    echo "4. Ha tiszta, akkor deploy"
    exit 1
fi