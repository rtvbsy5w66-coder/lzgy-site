# 🧪 Professional Test Execution Guide

## Overview

Ez a dokumentáció bemutatja a Political Site projekt átfogó tesztelési rendszerét, amely backend API, admin felület és felhasználói felület teszteket tartalmaz professzionális riportolással.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Suites](#test-suites)
- [Usage](#usage)
- [Report Structure](#report-structure)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Ensure jq is installed (for JSON parsing)
brew install jq  # macOS
# or
sudo apt-get install jq  # Linux
```

### Run All Tests

```bash
./scripts/test-runner.sh all
```

### Run Specific Test Suite

```bash
# Backend API tests only
./scripts/test-runner.sh backend

# Admin frontend tests only
./scripts/test-runner.sh admin

# User frontend tests only
./scripts/test-runner.sh frontend
```

---

## 🧩 Test Suites

### 1. Backend API v5 Tests

**Location**: `__tests__/api/`

**Coverage**:
- ✅ POST `/api/posts` - Create post
- ✅ GET `/api/posts` - List posts with filtering
- ✅ GET `/api/posts/[id]` - Get single post
- ✅ PUT `/api/posts/[id]` - Update post
- ✅ DELETE `/api/posts/[id]` - Delete post
- ✅ POST `/api/messages` - Contact form submission
- ✅ POST `/api/upload` - File upload (images, videos)
- ✅ GET `/api/events` - List events
- ✅ POST `/api/petitions/[id]/sign` - Sign petition
- ✅ POST `/api/polls/[id]/vote` - Submit poll vote

**Test Types**:
- Unit tests for API endpoints
- Integration tests with database
- Authentication & authorization tests
- Input validation tests
- Error handling tests

### 2. Admin Frontend Tests

**Location**: `__tests__/e2e/admin-*.test.ts`, `admin-auth.test.ts`

**Coverage**:
- ✅ Admin authentication (email/password)
- ✅ Dashboard access control
- ✅ Content management (CRUD operations)
- ✅ User management
- ✅ Analytics & statistics
- ✅ Settings & configuration

**Test Types**:
- End-to-end (E2E) tests
- Component integration tests
- Access control tests
- Form validation tests

### 3. User Frontend Tests

**Location**: `__tests__/components/`, `__tests__/pages/`

**Coverage**:
- ✅ User authentication (Google OAuth)
- ✅ Public page navigation
- ✅ News & events display
- ✅ Petition signing flow
- ✅ Poll voting flow
- ✅ Quiz participation
- ✅ Contact form submission
- ✅ Theme switching
- ✅ Responsive design

**Test Types**:
- Component unit tests
- User flow tests
- Accessibility tests
- Responsive design tests

---

## 📊 Usage

### Basic Usage

```bash
# Run all tests and generate comprehensive reports
./scripts/test-runner.sh all
```

### Targeted Testing

```bash
# Test only backend API
./scripts/test-runner.sh backend

# Test only admin interface
./scripts/test-runner.sh admin

# Test only user interface
./scripts/test-runner.sh frontend
```

### Continuous Testing

```bash
# Watch mode (auto-rerun on file changes)
npm run test:watch

# Coverage mode
npm run test:coverage
```

---

## 📄 Report Structure

### Report Locations

All reports are generated in the `./test-reports/` directory:

```
test-reports/
├── backend_report_YYYYMMDD_HHMMSS.txt      # Backend API detailed report
├── admin_report_YYYYMMDD_HHMMSS.txt        # Admin frontend detailed report
├── frontend_report_YYYYMMDD_HHMMSS.txt     # User frontend detailed report
└── summary_report_YYYYMMDD_HHMMSS.txt      # Comprehensive summary
```

### Report Contents

Each report contains:

1. **Header Section**
   - Report timestamp
   - Test execution duration
   - Environment information

2. **Test Summary**
   - Total tests executed
   - Passed count
   - Failed count
   - Skipped count
   - Success rate percentage

3. **Feature Coverage**
   - List of tested features/endpoints
   - Coverage indicators

4. **Detailed Results**
   - Individual test outcomes
   - Error messages (if any)
   - Stack traces (for failures)

5. **Recommendations**
   - Next steps based on results
   - Deployment readiness assessment

### Summary Report Example

```
═══════════════════════════════════════════════════════════════════════════════
              COMPREHENSIVE TEST EXECUTION SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Project: Political Site
Test Execution Date: 2025-10-02 14:30:15
Environment: Development

───────────────────────────────────────────────────────────────────────────────
                        OVERALL STATUS
───────────────────────────────────────────────────────────────────────────────

Status: ✓ ALL TESTS PASSED

───────────────────────────────────────────────────────────────────────────────
                      TEST SUITE BREAKDOWN
───────────────────────────────────────────────────────────────────────────────

Backend API v5:      ✓ PASSED
Admin Frontend:      ✓ PASSED
User Frontend:       ✓ PASSED

───────────────────────────────────────────────────────────────────────────────
                         REPORT LOCATIONS
───────────────────────────────────────────────────────────────────────────────

Backend Report:      ./test-reports/backend_report_20251002_143015.txt
Admin Report:        ./test-reports/admin_report_20251002_143015.txt
Frontend Report:     ./test-reports/frontend_report_20251002_143015.txt
Summary Report:      ./test-reports/summary_report_20251002_143015.txt

───────────────────────────────────────────────────────────────────────────────
                          RECOMMENDATIONS
───────────────────────────────────────────────────────────────────────────────

✓ All tests passed! System is ready for deployment.
✓ Consider running performance tests before production release.

═══════════════════════════════════════════════════════════════════════════════
```

---

## 🔄 CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run test suite
        run: ./scripts/test-runner.sh all

      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: test-reports/
```

### Vercel Integration

Add to `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npm run test && npm run build"
  }
}
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. `jq: command not found`

**Solution**:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

#### 2. Permission Denied

**Solution**:
```bash
chmod +x ./scripts/test-runner.sh
```

#### 3. Tests Hanging

**Cause**: Database connection issues or missing environment variables

**Solution**:
```bash
# Check .env.local exists
ls -la .env.local

# Verify database connection
npm run prisma:studio
```

#### 4. Failed to Generate Reports

**Cause**: Missing test-reports directory or insufficient permissions

**Solution**:
```bash
# Create directory manually
mkdir -p test-reports

# Fix permissions
chmod 755 test-reports
```

### Debug Mode

Enable verbose output:

```bash
# Set debug flag
DEBUG=true ./scripts/test-runner.sh all

# Or use Jest's verbose mode
npm run test -- --verbose
```

---

## 📈 Best Practices

### Before Committing

```bash
# Run full test suite
./scripts/test-runner.sh all

# Check test coverage
npm run test:coverage

# Review reports
cat test-reports/summary_report_*.txt | tail -1
```

### Before Deploying

```bash
# Run all tests
./scripts/test-runner.sh all

# Ensure 100% pass rate
# Review detailed reports for any warnings
```

### Regular Maintenance

```bash
# Weekly: Run full test suite
./scripts/test-runner.sh all

# Monthly: Review and update tests
# Quarterly: Performance test review
```

---

## 🔗 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review existing test files in `__tests__/`
3. Check GitHub Issues
4. Contact development team

---

**Last Updated**: 2025-10-02
**Version**: 1.0.0
**Maintainer**: Development Team
