# Security Test Maintenance Guide
**Project:** Lovas Political Site
**Version:** 1.0
**Last Updated:** 2025-10-18

---

## Purpose

This guide provides step-by-step instructions for maintaining the security test suite over time, ensuring tests remain relevant, effective, and up-to-date.

---

## Table of Contents

1. [Daily/Weekly Tasks](#dailyweekly-tasks)
2. [Monthly Tasks](#monthly-tasks)
3. [Quarterly Tasks](#quarterly-tasks)
4. [When Code Changes](#when-code-changes)
5. [Coverage Monitoring](#coverage-monitoring)
6. [Dependency Updates](#dependency-updates)
7. [Adding New Tests](#adding-new-tests)
8. [Debugging Failed Tests](#debugging-failed-tests)
9. [Performance Monitoring](#performance-monitoring)
10. [Incident Response](#incident-response)

---

## Daily/Weekly Tasks

### Run Tests Before Commit

```bash
# Before every commit
git add .
npm test -- test/functional

# If tests pass
git commit -m "feat: description"

# If tests fail
# Fix tests or code before committing
```

### Check CI/CD Status

1. Visit GitHub Actions (or your CI/CD tool)
2. Verify all tests passed on main branch
3. If failed:
   - Check error logs
   - Reproduce locally
   - Fix immediately (priority task)

**Red Flag:** 🚨 If CI/CD tests fail on main, this is a P0 incident.

---

## Monthly Tasks

### 1. Full Test Suite Review

```bash
# Run complete test suite with coverage
npm test -- test/functional --coverage --verbose

# Review output for:
# - Any new warnings
# - Deprecated API usage
# - Slow tests (>100ms)
```

**Checklist:**
- [ ] All tests passing
- [ ] Coverage >80% on security files
- [ ] No console warnings/errors
- [ ] Test execution time <10 seconds

### 2. Dependency Audit

```bash
# Check for vulnerable dependencies
npm audit

# If vulnerabilities found:
npm audit fix

# Rerun tests after fixes
npm test -- test/functional
```

**Action Required:**
- HIGH/CRITICAL vulnerabilities: Fix immediately
- MODERATE vulnerabilities: Fix within 1 week
- LOW vulnerabilities: Fix within 1 month

### 3. Coverage Trend Analysis

```bash
# Generate coverage report
npm test -- test/functional --coverage

# Compare to previous month
# Goal: Coverage should increase or stay stable (not decrease)
```

**Track These Metrics:**
| Metric | Current | Last Month | Trend |
|--------|---------|------------|-------|
| Overall Coverage | XX% | XX% | ↑/↓/→ |
| Middleware Coverage | XX% | XX% | ↑/↓/→ |
| Validation Coverage | XX% | XX% | ↑/↓/→ |
| Rate Limit Coverage | XX% | XX% | ↑/↓/→ |

### 4. Update OWASP Mapping

Review and update [`OWASP_COMPLIANCE_MAPPING.md`](../OWASP_COMPLIANCE_MAPPING.md):
- [ ] New tests added?
- [ ] Coverage percentages updated?
- [ ] New OWASP categories addressed?

---

## Quarterly Tasks

### 1. Security Review Meeting

**Attendees:** Dev team, Security lead, Product owner

**Agenda:**
- Review security audit report
- Discuss new threats/vulnerabilities
- Plan security improvements
- Review OWASP Top 10 changes

**Deliverables:**
- Updated risk assessment
- Security roadmap for next quarter

### 2. Test Infrastructure Review

**Questions to Answer:**
- Are tests still fast enough? (<10s)
- Are mocks still accurate?
- Do we need new test categories?
- Should we refactor duplicate code?

**Actions:**
```bash
# Measure test performance
npm test -- test/functional --verbose 2>&1 | grep "Time:"

# Profile slow tests
# Identify test/functional/**/*.test.ts files > 1s
```

### 3. OWASP Top 10 Update Check

**Task:** Check if OWASP has released new Top 10 list

**If yes:**
- [ ] Review new categories
- [ ] Gap analysis (what's not covered?)
- [ ] Create plan to address gaps
- [ ] Update compliance mapping

**Resources:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### 4. Documentation Review

Update these documents:
- [ ] [`SECURITY_AUDIT_FINAL_REPORT.md`](../SECURITY_AUDIT_FINAL_REPORT.md)
- [ ] [`OWASP_COMPLIANCE_MAPPING.md`](../OWASP_COMPLIANCE_MAPPING.md)
- [ ] [`docs/SECURITY_TEST_STRATEGY.md`](./SECURITY_TEST_STRATEGY.md)
- [ ] This maintenance guide

---

## When Code Changes

### New Feature Added

**Process:**
1. Write security tests FIRST (TDD)
2. Implement feature
3. Ensure tests pass
4. Check coverage (must be >80%)
5. Update OWASP mapping if relevant

**Example Workflow:**
```bash
# 1. Create test file
touch test/functional/new-feature.functional.test.ts

# 2. Write failing tests
# (describe security requirements)

# 3. Implement feature
# (in src/)

# 4. Run tests until green
npm test -- test/functional/new-feature --watch

# 5. Check coverage
npm test -- test/functional/new-feature --coverage

# 6. If coverage < 80%, add more tests
```

### Bug Fix

**Process:**
1. Write test that reproduces bug
2. Verify test fails
3. Fix bug
4. Verify test passes
5. Add to regression test suite

**Example:**
```typescript
describe('REGRESSION: Bug #123 - SQL injection in search', () => {
  it('EXECUTES: Blocks SQL injection in search query', () => {
    const maliciousQuery = "'; DROP TABLE users; --";

    const result = searchQuerySchema.safeParse({ q: maliciousQuery });

    // This should fail validation
    expect(result.success).toBe(false);
  });
});
```

### Refactoring

**Process:**
1. Run tests BEFORE refactoring (ensure green)
2. Refactor code
3. Run tests AFTER refactoring (ensure still green)
4. Coverage should remain same or improve

**Red Flag:** 🚨 If refactoring causes tests to fail or coverage to drop, revert and investigate.

---

## Coverage Monitoring

### Check Current Coverage

```bash
# Generate coverage report
npm test -- test/functional --coverage

# View in terminal
cat coverage-functional/coverage-summary.json | jq

# View in browser
open coverage-functional/lcov-report/index.html
```

### Coverage Dropped Below 80%

**Immediate Actions:**
1. Identify which file dropped
2. Run `git diff` to see recent changes
3. Add tests for uncovered lines
4. Do NOT merge until coverage >80%

**Commands:**
```bash
# Find uncovered lines
npm test -- test/functional --coverage
open coverage-functional/lcov-report/index.html

# Look for RED highlighted lines
# Write tests for those specific scenarios
```

### Setting Up Coverage Thresholds

**Jest Configuration (`jest.config.mjs`):**
```javascript
export default {
  // ... other config
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 70,
      lines: 80,
    },
    './src/middleware.ts': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    './src/lib/validations/**/*.ts': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
```

---

## Dependency Updates

### Regular Update Process

**Weekly:**
```bash
# Check for outdated packages
npm outdated

# Update patch versions automatically
npm update
```

**Monthly:**
```bash
# Update minor versions
npm update --save

# Or use interactive updater
npx npm-check-updates -u -i
```

**After ANY dependency update:**
```bash
# ALWAYS run full test suite
npm test -- test/functional --coverage

# If tests fail, investigate:
# - Check breaking changes in dependency changelog
# - Update tests if API changed
# - Rollback if too complex
```

### Specific Security Dependencies

**Next.js:**
```bash
# Check current version
npm list next

# Update to latest
npm install next@latest

# Test thoroughly
npm test -- test/functional
```

**NextAuth:**
```bash
npm install next-auth@latest
npm test -- test/functional/middleware
```

**Zod:**
```bash
npm install zod@latest
npm test -- test/functional/validation
```

---

## Adding New Tests

### Step-by-Step Process

#### 1. Identify What Needs Testing

**Questions:**
- Is this user input?
- Is this authentication/authorization logic?
- Is this a security-critical operation?
- Does this handle sensitive data?

**If YES to any → Write security test**

#### 2. Choose Test File

```bash
# Authentication/Authorization
test/functional/middleware.functional.test.ts

# Input Validation
test/functional/validation.functional.test.ts

# Rate Limiting
test/functional/rate-limit.functional.test.ts

# Newsletter Specific
test/functional/newsletter-flow.functional.test.ts

# New Feature
test/functional/[feature-name].functional.test.ts
```

#### 3. Write Test

**Template:**
```typescript
describe('FUNCTIONAL: [Feature] - Real Execution', () => {
  describe('[Sub-Feature]', () => {
    it('EXECUTES: [Specific security scenario]', async () => {
      // Arrange: Setup test data
      const input = 'test data';

      // Act: Execute real code
      const result = await functionUnderTest(input);

      // Assert: Verify security behavior
      expect(result).toBeDefined();
      expect(result.secure).toBe(true);
    });
  });
});
```

#### 4. Verify Test Quality

**Checklist:**
- [ ] Test name starts with "EXECUTES:"
- [ ] Test actually calls production code (not just type checks)
- [ ] Test has clear assertions
- [ ] Test covers security scenario
- [ ] Test is fast (<100ms)
- [ ] Test is deterministic (same result every time)

#### 5. Update Documentation

- [ ] Add test to OWASP mapping if relevant
- [ ] Update test count in audit report
- [ ] Add to coverage tracking

---

## Debugging Failed Tests

### Step 1: Reproduce Locally

```bash
# Run specific failing test
npm test -- test/functional/middleware -t "EXECUTES: Redirect to login"

# Run with verbose output
npm test -- test/functional/middleware --verbose

# Run with debug output
DEBUG=* npm test -- test/functional/middleware
```

### Step 2: Common Failure Patterns

#### Pattern 1: "TypeError: X is not a function"

**Cause:** Mock not properly set up

**Fix:**
```typescript
// Ensure mock is defined before test
jest.mock('module-name', () => ({
  functionName: jest.fn(),
}));

const mockedFunction = functionName as jest.MockedFunction<typeof functionName>;
```

#### Pattern 2: "Expect received: undefined"

**Cause:** Async function not awaited

**Fix:**
```typescript
// Wrong
it('test', () => {
  const result = asyncFunction();
  expect(result).toBe('value');
});

// Correct
it('test', async () => {
  const result = await asyncFunction();
  expect(result).toBe('value');
});
```

#### Pattern 3: "Coverage decreased"

**Cause:** New code added without tests

**Fix:**
1. Generate coverage report
2. Open HTML report
3. Find uncovered lines (red)
4. Write tests for those lines

### Step 3: Seek Help

**Internal Resources:**
- Check this maintenance guide
- Review [Security Test Strategy](./SECURITY_TEST_STRATEGY.md)
- Check git history: `git log test/functional/[file]`

**External Resources:**
- [Jest Troubleshooting](https://jestjs.io/docs/troubleshooting)
- Stack Overflow
- GitHub Issues in relevant packages

---

## Performance Monitoring

### Test Execution Time

**Target:** < 10 seconds for full suite

**Monitoring:**
```bash
# Time full suite
time npm test -- test/functional

# Identify slow tests
npm test -- test/functional --verbose | grep "Time:"
```

**If tests are slow (>10s):**
1. Identify slowest tests
2. Optimize or parallelize
3. Consider splitting into separate files

### Coverage Generation Time

**Target:** < 5 seconds additional overhead

**Monitoring:**
```bash
# Without coverage
time npm test -- test/functional

# With coverage
time npm test -- test/functional --coverage

# Difference should be < 5s
```

---

## Incident Response

### Security Vulnerability Discovered

**Priority:** 🚨 P0 - Immediate Action Required

**Process:**
1. **Immediately:** Create private security advisory
2. **Write test:** that demonstrates vulnerability
3. **Verify test fails:** confirming vulnerability exists
4. **Fix vulnerability:** in code
5. **Verify test passes:** confirming fix works
6. **Deploy fix:** ASAP
7. **Publish advisory:** after deploy

**Example:**
```typescript
// Step 2: Write test for vulnerability
describe('SECURITY: CVE-2024-XXXX - Auth Bypass', () => {
  it('EXECUTES: Blocks auth bypass via header manipulation', () => {
    const maliciousRequest = createMockRequest({
      headers: { 'x-user-role': 'ADMIN' }, // Attacker trying to fake role
    });

    const result = validateAuth(maliciousRequest);

    expect(result.authenticated).toBe(false);
    expect(result.error).toContain('Invalid authentication');
  });
});
```

### Tests Failing in CI/CD

**Priority:** 🚨 P0 - Block All Merges

**Process:**
1. **Do NOT merge** any PRs until fixed
2. Reproduce failure locally
3. Identify cause (code change? dependency? environment?)
4. Fix immediately
5. Verify fix in CI/CD
6. Resume normal operations

### Coverage Drop Alert

**Priority:** 🟡 P1 - Fix Within 24 Hours

**Process:**
1. Identify which file coverage dropped
2. Review recent commits to that file
3. Add missing tests
4. Ensure coverage back >80%

---

## Automation Recommendations

### Pre-commit Hook

**.husky/pre-commit:**
```bash
#!/bin/sh
npm test -- test/functional --passWithNoTests

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix before committing."
  exit 1
fi
```

### CI/CD Pipeline

**GitHub Actions (.github/workflows/tests.yml):**
```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- test/functional --coverage
      - name: Coverage Check
        run: |
          COVERAGE=$(cat coverage-functional/coverage-summary.json | jq '.total.statements.pct')
          echo "Coverage: $COVERAGE%"
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "❌ Coverage below 80%"
            exit 1
          fi
```

### Coverage Badge

**README.md:**
```markdown
![Coverage](https://img.shields.io/badge/coverage-93%25-brightgreen)
```

---

## Checklist: Monthly Maintenance

Print this checklist and complete monthly:

```
Month: ________ Year: ________

[ ] Run full test suite with coverage
[ ] All tests passing (132/132)
[ ] Coverage >80% on all security files
[ ] npm audit run (0 high/critical vulnerabilities)
[ ] Dependencies updated (npm update)
[ ] OWASP mapping updated
[ ] Coverage trends documented
[ ] Slow tests identified and optimized
[ ] Documentation reviewed and updated
[ ] Team briefed on any changes

Notes:
_____________________________________________
_____________________________________________
_____________________________________________

Completed by: ________________ Date: ________
```

---

## Contact & Support

**Questions?** Contact:
- Security Team Lead: [email]
- DevOps Team: [email]
- Project Slack: #security-testing

**Resources:**
- Internal Wiki: [link]
- Security Policies: [link]
- Incident Response Plan: [link]

---

**Document Owner:** Security Team
**Review Frequency:** Quarterly
**Last Review:** 2025-10-18
**Next Review:** 2026-01-18

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-18 | Initial creation | Security Team |
