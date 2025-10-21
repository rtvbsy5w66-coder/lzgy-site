# Security Test Strategy
**Project:** Lovas Political Site
**Version:** 1.0
**Last Updated:** 2025-10-18

---

## Overview

This document outlines the comprehensive security testing strategy for the Lovas Political Site, with emphasis on the newsletter system, admin authentication, and OWASP Top 10 compliance.

---

## Test Pyramid

Our security testing follows a modified test pyramid approach:

```
                    /\
                   /  \
                  / E2E\ (10%)
                 /──────\
                /  Func  \ (60%)
               /  Tests   \
              /────────────\
             /    Unit      \ (30%)
            /     Tests      \
           /──────────────────\
```

### Distribution

1. **Unit Tests (30%)** - Individual function validation
   - Zod schema parsing
   - Utility functions
   - Helper methods

2. **Functional Tests (60%)** - CORE FOCUS
   - Authentication flows
   - Rate limiting
   - Input validation
   - Newsletter flows

3. **E2E Tests (10%)** - User journey validation
   - Newsletter subscription flow
   - Admin campaign creation

---

## Test Categories

### 1. Authentication & Authorization Tests

**Location:** `test/functional/middleware.functional.test.ts`

**Purpose:** Verify that access control mechanisms prevent unauthorized access.

**Coverage:**
- JWT token validation
- Role-Based Access Control (RBAC)
- Session management
- Redirect logic
- Error handling

**Key Test Scenarios:**
```typescript
✅ Public routes accessible without authentication
✅ Admin routes require valid JWT token
✅ Non-ADMIN roles cannot access admin functions
✅ Horizontal privilege escalation blocked
✅ Proper error messages (no info leakage)
```

**OWASP Mapping:** A01 (Broken Access Control), A07 (Auth Failures)

---

### 2. Rate Limiting Tests

**Location:** `test/functional/rate-limit.functional.test.ts`

**Purpose:** Prevent brute force attacks, spam, and abuse through rate limiting.

**Coverage:**
- Request counting per identifier (IP)
- Time window enforcement
- Limit configurations
- Response generation
- Concurrent request handling

**Key Test Scenarios:**
```typescript
✅ Brute force login attempts blocked after limit
✅ Newsletter spam prevention (3 per hour)
✅ Independent rate limiting per IP
✅ Proper 429 response creation
✅ Reset timestamp calculation
```

**OWASP Mapping:** A07 (Auth Failures), A04 (Insecure Design)

---

### 3. Input Validation Tests

**Location:** `test/functional/validation.functional.test.ts`

**Purpose:** Prevent injection attacks through comprehensive input validation.

**Coverage:**
- Zod schema execution
- SQL injection patterns
- XSS detection
- Path traversal blocking
- Email/phone format validation
- Data transformation (lowercase, trim)

**Key Test Scenarios:**
```typescript
✅ SQL injection blocked (' OR '1'='1)
✅ XSS patterns detected (<script>alert(1)</script>)
✅ Path traversal blocked (../../../etc/passwd)
✅ Email normalization (lowercase)
✅ Input length limits enforced
```

**OWASP Mapping:** A03 (Injection)

---

### 4. Newsletter Flow Tests

**Location:** `test/functional/newsletter-flow.functional.test.ts`

**Purpose:** End-to-end validation of newsletter lifecycle.

**Coverage:**
- Subscription validation
- Unsubscribe validation
- Campaign creation (admin)
- Category management
- Rate limiting integration

**Key Test Scenarios:**
```typescript
✅ Complete subscription flow with validation
✅ Subscription rate limiting (3 per hour)
✅ Multi-category subscription
✅ Unsubscribe with email or token
✅ Admin campaign creation for categories
```

**OWASP Mapping:** A03 (Injection), A04 (Insecure Design)

---

## Running Tests

### Quick Start

```bash
# Run all functional tests
npm test -- test/functional

# Run with coverage
npm test -- test/functional --coverage

# Run specific test file
npm test -- test/functional/middleware

# Watch mode (development)
npm test -- test/functional --watch
```

### Coverage Reports

```bash
# Generate HTML coverage report
npm test -- test/functional --coverage --coverageDirectory=coverage-functional

# Open coverage report
open coverage-functional/lcov-report/index.html
```

### CI/CD Integration

```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- test/functional --coverage
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage-functional/coverage-summary.json | jq '.total.statements.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
```

---

## Adding New Security Tests

### Step-by-Step Guide

#### 1. Identify Security-Critical Code

Look for:
- User input handling
- Authentication/authorization logic
- Data access patterns
- External API calls
- File operations

#### 2. Create Test File

```bash
# Create new test file
touch test/functional/new-feature.functional.test.ts
```

#### 3. Write Functional Tests

```typescript
/**
 * FUNCTIONAL TEST: [Feature Name] - REAL CODE EXECUTION
 *
 * Description of what security aspect is being tested
 */

import { featureFunction } from '@/lib/feature';

describe('FUNCTIONAL: Feature Name - Real Execution', () => {
  it('EXECUTES: Security scenario description', async () => {
    // Arrange: Set up test data
    const maliciousInput = '<script>alert("xss")</script>';

    // Act: Execute the actual code
    const result = featureFunction(maliciousInput);

    // Assert: Verify security behavior
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid input');
  });
});
```

#### 4. Ensure High Coverage

**Target:** 80%+ coverage on security-critical code

```bash
# Check coverage for specific file
npm test -- test/functional/new-feature --coverage
```

#### 5. Document OWASP Mapping

Update `OWASP_COMPLIANCE_MAPPING.md` with:
- Test file location
- Test name
- Line numbers
- OWASP category

---

## Test Quality Standards

### Must-Have for All Security Tests

1. **✅ Descriptive Names**
   ```typescript
   ✅ Good: "EXECUTES: Blocks SQL injection in email field"
   ❌ Bad: "Test email"
   ```

2. **✅ Real Code Execution**
   ```typescript
   ✅ Good: const result = validateEmail(input); // Actual function call
   ❌ Bad: expect(validateEmail).toBeDefined(); // Just type checking
   ```

3. **✅ Explicit Assertions**
   ```typescript
   ✅ Good: expect(result.error).toBe('Invalid email format');
   ❌ Bad: expect(result).toBeTruthy();
   ```

4. **✅ Security Context**
   ```typescript
   it('EXECUTES: Prevents horizontal privilege escalation', () => {
     // Test clearly states what attack is being prevented
   });
   ```

5. **✅ Edge Cases**
   ```typescript
   // Test boundary conditions
   - Empty input
   - Maximum length input
   - Unicode characters
   - Null/undefined
   - Concurrent requests
   ```

---

## Coverage Targets

### Per-File Coverage Goals

| File Type | Statement | Branch | Function | Priority |
|-----------|-----------|--------|----------|----------|
| Auth/Middleware | 90%+ | 90%+ | 90%+ | 🔴 Critical |
| Input Validation | 90%+ | 90%+ | 90%+ | 🔴 Critical |
| Rate Limiting | 80%+ | 80%+ | 70%+ | 🟡 High |
| API Routes | 70%+ | 70%+ | 70%+ | 🟢 Medium |
| Utils | 60%+ | 60%+ | 60%+ | 🟢 Medium |

### Project-Wide Goals

- **Minimum:** 80% coverage on all security files
- **Target:** 90% coverage on critical paths
- **Stretch:** 95%+ coverage on auth/validation

---

## Test Maintenance

### Monthly Tasks

- [ ] Run full test suite
- [ ] Review coverage trends
- [ ] Update dependencies (`npm update`)
- [ ] Review and update OWASP mapping

### When Adding Features

- [ ] Write security tests FIRST (TDD approach)
- [ ] Ensure 80%+ coverage before merge
- [ ] Update OWASP mapping document
- [ ] Add test to CI/CD if needed

### When Fixing Bugs

- [ ] Write failing test that reproduces bug
- [ ] Fix the code
- [ ] Verify test now passes
- [ ] Add regression test to suite

---

## Common Patterns

### Pattern 1: Authentication Test

```typescript
it('EXECUTES: Requires authentication for protected resource', async () => {
  mockedGetToken.mockResolvedValue(null); // No auth

  const request = createMockNextRequest('http://localhost/admin/dashboard');
  const response = await middleware(request);

  expect(response.status).toBe(307); // Redirect to login
  expect(response.headers.get('location')).toContain('/login');
});
```

### Pattern 2: Input Validation Test

```typescript
it('EXECUTES: Rejects invalid email format', () => {
  const invalidEmails = ['not-email', '@example.com', 'user@'];

  invalidEmails.forEach(email => {
    const result = emailSchema.safeParse(email);
    expect(result.success).toBe(false);
  });
});
```

### Pattern 3: Rate Limiting Test

```typescript
it('EXECUTES: Blocks after limit exceeded', async () => {
  const identifier = 'test-ip';
  const config = { max: 3, window: 60000 };

  // Exhaust limit
  await rateLimit(identifier, config);
  await rateLimit(identifier, config);
  await rateLimit(identifier, config);

  // Should be blocked
  const blocked = await rateLimit(identifier, config);
  expect(blocked.success).toBe(false);
});
```

---

## Troubleshooting

### Tests Failing Intermittently

**Symptom:** Tests pass sometimes, fail other times

**Causes:**
- Timing issues in rate limiting tests
- Shared state between tests
- Date/time dependencies

**Solutions:**
```typescript
// Use jest.useFakeTimers() for time-dependent tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Clear state between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Low Coverage on File

**Symptom:** Coverage below 80% on critical file

**Debugging:**
```bash
# 1. Generate coverage report
npm test -- test/functional --coverage

# 2. Open HTML report
open coverage-functional/lcov-report/index.html

# 3. Find uncovered lines (highlighted in red)

# 4. Write tests for those specific lines
```

### Mock Issues

**Symptom:** `TypeError: X is not a function`

**Solution:**
```typescript
// Ensure proper mocking
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Use type-safe mocks
const mockedFunction = functionName as jest.MockedFunction<typeof functionName>;
```

---

## Resources

### Internal Documentation

- [OWASP Compliance Mapping](../OWASP_COMPLIANCE_MAPPING.md)
- [Security Audit Final Report](../SECURITY_AUDIT_FINAL_REPORT.md)
- [Test Maintenance Guide](./TEST_MAINTENANCE_GUIDE.md)

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Zod Documentation](https://zod.dev/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)

---

**Document Owner:** Security Team
**Review Frequency:** Quarterly
**Last Review:** 2025-10-18
**Next Review:** 2026-01-18
