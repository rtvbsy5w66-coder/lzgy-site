#!/bin/bash

# 🔒 SECURITY TESTING SCRIPT
# This script tests the implemented security measures

echo "🛡️  BIZTONSÁGI TESZT INDÍTÁSA..."
echo "=================================="

# Detect environment
if [ "$CI" = "true" ]; then
    echo "🔍 CI Environment detected"
    BASE_URL="http://localhost:3000"
    MAX_RETRIES=30
    RETRY_DELAY=2
else
    echo "🔍 Local Environment detected"
    BASE_URL="http://localhost:3001"
    MAX_RETRIES=10
    RETRY_DELAY=1
fi

API_URL="$BASE_URL/api"

# Wait for application to be ready
echo "⏳ Waiting for application to start..."
for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s "$API_URL/csrf-token" > /dev/null 2>&1; then
        echo "✅ Application is ready!"
        break
    fi
    if [ $i -eq $MAX_RETRIES ]; then
        echo "❌ Application failed to start within timeout!"
        exit 1
    fi
    echo "   Attempt $i/$MAX_RETRIES - waiting..."
    sleep $RETRY_DELAY
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local data="$5"
    
    echo -n "Testing $name... "
    
    if [[ "$method" == "POST" && -n "$data" ]]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_URL$endpoint")
    fi
    
    if [[ "$response" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

echo -e "${BLUE}1. RATE LIMITING TESZT${NC}"
echo "========================"

# Test multiple rapid requests to same endpoint
echo "Testing rate limiting on petition endpoint..."
for i in {1..6}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}' \
        "$API_URL/petitions/test-id/sign")
    echo "Request $i: HTTP $response"
    if [[ "$response" == "429" ]]; then
        echo -e "${GREEN}✅ Rate limiting activated after request $i${NC}"
        break
    fi
done

echo ""
echo -e "${BLUE}2. AUTHENTICATION TESZT${NC}"
echo "=========================="

# Test admin endpoints without auth
test_endpoint "Admin API without auth" "GET" "/admin/news-categories" "401"
test_endpoint "Admin POST without auth" "POST" "/admin/news-categories" "401" '{"name":"Test Category"}'

echo ""
echo -e "${BLUE}3. INPUT VALIDATION TESZT${NC}"
echo "============================"

# Test SQL injection attempts
test_endpoint "SQL Injection attempt" "POST" "/petitions/test-id/sign" "400" \
    '{"email":"test@example.com","firstName":"Robert\"; DROP TABLE signatures; --","lastName":"User"}'

# Test XSS attempts
test_endpoint "XSS attempt" "POST" "/petitions/test-id/sign" "400" \
    '{"email":"test@example.com","firstName":"<script>alert(\"xss\")</script>","lastName":"User"}'

# Test invalid email
test_endpoint "Invalid email format" "POST" "/petitions/test-id/sign" "400" \
    '{"email":"invalid-email","firstName":"Test","lastName":"User"}'

echo ""
echo -e "${BLUE}4. CSRF PROTECTION TESZT${NC}"
echo "=========================="

# Test POST without CSRF token
test_endpoint "POST without CSRF token" "POST" "/petitions/test-id/sign" "403" \
    '{"email":"test@example.com","firstName":"Test","lastName":"User"}'

echo ""
echo -e "${BLUE}5. DATA SANITIZATION TESZT${NC}"
echo "=============================="

# Test HTML content sanitization
echo "Testing HTML sanitization..."
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: test-token" \
    -d '{"email":"test@example.com","firstName":"<b>Bold</b>","lastName":"<script>alert()</script>User"}' \
    "$API_URL/petitions/test-id/sign")

echo "Response: $response"

echo ""
echo -e "${BLUE}TESZT EREDMÉNYEK${NC}"
echo "=================="
echo -e "Sikeres tesztek: ${GREEN}$PASSED${NC}"
echo -e "Sikertelen tesztek: ${RED}$FAILED${NC}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 MINDEN BIZTONSÁGI TESZT SIKERES!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  VAN BIZTONSÁGI PROBLÉMA! Ellenőrizze a sikertelen teszteket.${NC}"
    exit 1
fi