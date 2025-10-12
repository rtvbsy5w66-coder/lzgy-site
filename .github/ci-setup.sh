#!/bin/bash

# 🔧 CI SETUP SCRIPT
# This script prepares the CI environment for security testing

set -e  # Exit on any error

echo "🔧 CI ENVIRONMENT SETUP"
echo "======================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Environment variables validation
echo -e "${BLUE}1. ENVIRONMENT VALIDATION${NC}"
echo "=========================="

required_vars=(
    "NODE_ENV"
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "CI"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
        echo -e "${RED}❌ Missing: $var${NC}"
    else
        echo -e "${GREEN}✅ Found: $var${NC}"
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment validation passed!${NC}"
echo ""

# Database setup verification
echo -e "${BLUE}2. DATABASE VERIFICATION${NC}"
echo "========================"

echo "🔍 Testing database connection..."
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL client not found!${NC}"
    exit 1
fi

# Extract database info from URL
DB_HOST=$(echo $DATABASE_URL | grep -o 'mysql://[^:]*:[^@]*@[^:]*' | sed 's/mysql:\/\/[^:]*:[^@]*@//')
DB_PORT=$(echo $DATABASE_URL | grep -o ':[0-9]*/' | sed 's/[:/]//g')
DB_NAME=$(echo $DATABASE_URL | grep -o '/[^?]*' | sed 's/\///' | cut -d'?' -f1)
DB_USER=$(echo $DATABASE_URL | grep -o '://[^:]*' | sed 's/:\/\///')
DB_PASS=$(echo $DATABASE_URL | grep -o ':[^@]*@' | sed 's/[:@]//g')

echo "🗄️ Database details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Test connection
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed!${NC}"
    exit 1
fi

echo ""

# Node.js and NPM verification
echo -e "${BLUE}3. NODE.JS VERIFICATION${NC}"
echo "======================"

echo "📦 Node.js version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Check Node version (should be 18+)
NODE_MAJOR=$(node --version | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version compatible!${NC}"
echo ""

# Security tools verification
echo -e "${BLUE}4. SECURITY TOOLS VERIFICATION${NC}"
echo "=============================="

# Check if security-test.sh exists and is executable
if [ -f "./security-test.sh" ]; then
    if [ -x "./security-test.sh" ]; then
        echo -e "${GREEN}✅ security-test.sh is executable${NC}"
    else
        echo -e "${YELLOW}⚠️  Making security-test.sh executable...${NC}"
        chmod +x ./security-test.sh
    fi
else
    echo -e "${RED}❌ security-test.sh not found!${NC}"
    exit 1
fi

# Check for curl (needed for API testing)
if command -v curl &> /dev/null; then
    echo -e "${GREEN}✅ curl is available${NC}"
else
    echo -e "${RED}❌ curl is required for API testing!${NC}"
    exit 1
fi

# Check for jq (needed for JSON parsing)
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✅ jq is available${NC}"
else
    echo -e "${YELLOW}⚠️  jq not found, installing...${NC}"
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v yum &> /dev/null; then
        sudo yum install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        echo -e "${RED}❌ Could not install jq!${NC}"
        exit 1
    fi
fi

echo ""

# Prisma setup
echo -e "${BLUE}5. PRISMA SETUP${NC}"
echo "==============="

echo "🔧 Generating Prisma client..."
if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma client generated!${NC}"
else
    echo -e "${RED}❌ Prisma client generation failed!${NC}"
    exit 1
fi

echo "🗄️ Setting up database schema..."
if npx prisma db push --force-reset --skip-generate; then
    echo -e "${GREEN}✅ Database schema applied!${NC}"
else
    echo -e "${RED}❌ Database schema setup failed!${NC}"
    exit 1
fi

echo ""

# Application build
echo -e "${BLUE}6. APPLICATION BUILD${NC}"
echo "==================="

echo "🔧 Building application..."
if npm run build; then
    echo -e "${GREEN}✅ Application built successfully!${NC}"
else
    echo -e "${RED}❌ Application build failed!${NC}"
    exit 1
fi

echo ""

# Final validation
echo -e "${BLUE}7. FINAL VALIDATION${NC}"
echo "=================="

echo "🔍 Checking critical files..."
critical_files=(
    ".env.test.local"
    "dist"
    ".next"
    "node_modules/.prisma"
)

for file in "${critical_files[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing: $file${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 CI SETUP COMPLETE!${NC}"
echo "===================="
echo ""
echo "📋 Environment Summary:"
echo "   Node.js: $(node --version)"
echo "   NPM: $(npm --version)"
echo "   Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "   Environment: $NODE_ENV"
echo "   CI: $CI"
echo ""
echo -e "${GREEN}✅ Ready for security testing!${NC}"