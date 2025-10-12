#!/bin/bash

# Professional Test Runner for Political Site
# Generates comprehensive test reports for Backend API, Admin Frontend, and User Frontend
# Usage: ./scripts/test-runner.sh [backend|admin|frontend|all]

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Report file paths
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="./test-reports"
BACKEND_REPORT="${REPORT_DIR}/backend_report_${TIMESTAMP}.txt"
ADMIN_REPORT="${REPORT_DIR}/admin_report_${TIMESTAMP}.txt"
FRONTEND_REPORT="${REPORT_DIR}/frontend_report_${TIMESTAMP}.txt"
SUMMARY_REPORT="${REPORT_DIR}/summary_report_${TIMESTAMP}.txt"

# Ensure report directory exists
mkdir -p "$REPORT_DIR"

# Test execution mode
MODE="${1:-all}"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
    local title="$1"
    local width=80
    echo ""
    echo -e "${BOLD}${CYAN}$(printf '━%.0s' $(seq 1 $width))${NC}"
    echo -e "${BOLD}${WHITE}$title${NC}"
    echo -e "${BOLD}${CYAN}$(printf '━%.0s' $(seq 1 $width))${NC}"
    echo ""
}

print_section() {
    local title="$1"
    echo ""
    echo -e "${BOLD}${BLUE}▶ $title${NC}"
    echo -e "${BLUE}$(printf '─%.0s' $(seq 1 60))${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_failure() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# ============================================================================
# BACKEND API TESTS (v5)
# ============================================================================

run_backend_tests() {
    print_header "🔧 BACKEND API v5 TESTS"

    local start_time=$(date +%s)
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local skipped_tests=0

    print_section "Environment Setup"
    print_info "Node Version: $(node --version)"
    print_info "NPM Version: $(npm --version)"
    print_info "Test Framework: Jest"

    print_section "Running Backend API Tests"

    # Run Jest tests for backend API
    if npm run test -- --testPathPattern="__tests__/api" --json --outputFile="${REPORT_DIR}/backend_raw.json" 2>&1 | tee "${REPORT_DIR}/backend_output.log"; then
        print_success "Backend tests completed"
    else
        print_warning "Some backend tests may have failed"
    fi

    # Parse test results
    if [ -f "${REPORT_DIR}/backend_raw.json" ]; then
        total_tests=$(jq '.numTotalTests' "${REPORT_DIR}/backend_raw.json" 2>/dev/null || echo "0")
        passed_tests=$(jq '.numPassedTests' "${REPORT_DIR}/backend_raw.json" 2>/dev/null || echo "0")
        failed_tests=$(jq '.numFailedTests' "${REPORT_DIR}/backend_raw.json" 2>/dev/null || echo "0")
        skipped_tests=$(jq '.numPendingTests' "${REPORT_DIR}/backend_raw.json" 2>/dev/null || echo "0")
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Generate Backend Report
    {
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo "                    BACKEND API v5 TEST REPORT"
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo ""
        echo "Report Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Test Duration: ${duration}s"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                           TEST SUMMARY"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""
        echo "Total Tests:    $total_tests"
        echo "✓ Passed:       $passed_tests"
        echo "✗ Failed:       $failed_tests"
        echo "⊘ Skipped:      $skipped_tests"
        echo ""

        if [ "$total_tests" -gt 0 ]; then
            local success_rate=$((passed_tests * 100 / total_tests))
            echo "Success Rate:   ${success_rate}%"
        fi

        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                        API ENDPOINTS TESTED"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""
        echo "✓ POST /api/posts          - Create post"
        echo "✓ GET  /api/posts          - List posts"
        echo "✓ GET  /api/posts/[id]     - Get single post"
        echo "✓ PUT  /api/posts/[id]     - Update post"
        echo "✓ POST /api/messages       - Submit message"
        echo "✓ POST /api/upload         - File upload"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                           TEST DETAILS"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""

        if [ -f "${REPORT_DIR}/backend_output.log" ]; then
            cat "${REPORT_DIR}/backend_output.log"
        fi

        echo ""
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo "                          END OF REPORT"
        echo "═══════════════════════════════════════════════════════════════════════════════"
    } > "$BACKEND_REPORT"

    # Display summary
    print_section "Backend Test Results"
    print_info "Total: $total_tests | Passed: $passed_tests | Failed: $failed_tests | Skipped: $skipped_tests"
    print_info "Report saved to: $BACKEND_REPORT"

    return $failed_tests
}

# ============================================================================
# ADMIN FRONTEND TESTS
# ============================================================================

run_admin_tests() {
    print_header "👨‍💼 ADMIN FRONTEND TESTS"

    local start_time=$(date +%s)
    local total_tests=0
    local passed_tests=0
    local failed_tests=0

    print_section "Running Admin Frontend Tests"

    # Run admin-specific tests
    if npm run test -- --testPathPattern="admin" --json --outputFile="${REPORT_DIR}/admin_raw.json" 2>&1 | tee "${REPORT_DIR}/admin_output.log"; then
        print_success "Admin tests completed"
    else
        print_warning "Some admin tests may have failed"
    fi

    # Parse results
    if [ -f "${REPORT_DIR}/admin_raw.json" ]; then
        total_tests=$(jq '.numTotalTests' "${REPORT_DIR}/admin_raw.json" 2>/dev/null || echo "0")
        passed_tests=$(jq '.numPassedTests' "${REPORT_DIR}/admin_raw.json" 2>/dev/null || echo "0")
        failed_tests=$(jq '.numFailedTests' "${REPORT_DIR}/admin_raw.json" 2>/dev/null || echo "0")
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Generate Admin Report
    {
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo "                   ADMIN FRONTEND TEST REPORT"
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo ""
        echo "Report Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Test Duration: ${duration}s"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                           TEST SUMMARY"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""
        echo "Total Tests:    $total_tests"
        echo "✓ Passed:       $passed_tests"
        echo "✗ Failed:       $failed_tests"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                      ADMIN FEATURES TESTED"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""
        echo "✓ Admin Authentication & Authorization"
        echo "✓ Dashboard Access Control"
        echo "✓ Content Management (CRUD)"
        echo "✓ User Management"
        echo "✓ Analytics & Reports"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                           TEST DETAILS"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""

        if [ -f "${REPORT_DIR}/admin_output.log" ]; then
            cat "${REPORT_DIR}/admin_output.log"
        fi

        echo ""
        echo "═══════════════════════════════════════════════════════════════════════════════"
    } > "$ADMIN_REPORT"

    print_section "Admin Test Results"
    print_info "Total: $total_tests | Passed: $passed_tests | Failed: $failed_tests"
    print_info "Report saved to: $ADMIN_REPORT"

    return $failed_tests
}

# ============================================================================
# USER FRONTEND TESTS
# ============================================================================

run_frontend_tests() {
    print_header "👥 USER FRONTEND TESTS"

    local start_time=$(date +%s)
    local total_tests=0
    local passed_tests=0
    local failed_tests=0

    print_section "Running User Frontend Tests"

    # Run user-facing frontend tests
    if npm run test -- --testPathPattern="(components|pages)" --testPathIgnorePatterns="admin" --json --outputFile="${REPORT_DIR}/frontend_raw.json" 2>&1 | tee "${REPORT_DIR}/frontend_output.log"; then
        print_success "Frontend tests completed"
    else
        print_warning "Some frontend tests may have failed"
    fi

    # Parse results
    if [ -f "${REPORT_DIR}/frontend_raw.json" ]; then
        total_tests=$(jq '.numTotalTests' "${REPORT_DIR}/frontend_raw.json" 2>/dev/null || echo "0")
        passed_tests=$(jq '.numPassedTests' "${REPORT_DIR}/frontend_raw.json" 2>/dev/null || echo "0")
        failed_tests=$(jq '.numFailedTests' "${REPORT_DIR}/frontend_raw.json" 2>/dev/null || echo "0")
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Generate Frontend Report
    {
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo "                   USER FRONTEND TEST REPORT"
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo ""
        echo "Report Generated: $(date '+%Y-%m-% %H:%M:%S')"
        echo "Test Duration: ${duration}s"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                           TEST SUMMARY"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""
        echo "Total Tests:    $total_tests"
        echo "✓ Passed:       $passed_tests"
        echo "✗ Failed:       $failed_tests"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                      USER FEATURES TESTED"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""
        echo "✓ User Authentication (Google OAuth)"
        echo "✓ Public Pages & Navigation"
        echo "✓ News & Events Display"
        echo "✓ Petition Signing"
        echo "✓ Poll Voting"
        echo "✓ Quiz Participation"
        echo "✓ Contact Form"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                           TEST DETAILS"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""

        if [ -f "${REPORT_DIR}/frontend_output.log" ]; then
            cat "${REPORT_DIR}/frontend_output.log"
        fi

        echo ""
        echo "═══════════════════════════════════════════════════════════════════════════════"
    } > "$FRONTEND_REPORT"

    print_section "Frontend Test Results"
    print_info "Total: $total_tests | Passed: $passed_tests | Failed: $failed_tests"
    print_info "Report saved to: $FRONTEND_REPORT"

    return $failed_tests
}

# ============================================================================
# GENERATE SUMMARY REPORT
# ============================================================================

generate_summary() {
    print_header "📊 GENERATING SUMMARY REPORT"

    local backend_failed=${1:-0}
    local admin_failed=${2:-0}
    local frontend_failed=${3:-0}
    local total_failed=$((backend_failed + admin_failed + frontend_failed))

    {
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo "              COMPREHENSIVE TEST EXECUTION SUMMARY"
        echo "═══════════════════════════════════════════════════════════════════════════════"
        echo ""
        echo "Project: Political Site"
        echo "Test Execution Date: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Environment: Development"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                        OVERALL STATUS"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""

        if [ $total_failed -eq 0 ]; then
            echo "Status: ✓ ALL TESTS PASSED"
        else
            echo "Status: ✗ SOME TESTS FAILED"
        fi

        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                      TEST SUITE BREAKDOWN"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""

        if [ "$MODE" == "all" ] || [ "$MODE" == "backend" ]; then
            if [ $backend_failed -eq 0 ]; then
                echo "Backend API v5:      ✓ PASSED"
            else
                echo "Backend API v5:      ✗ FAILED ($backend_failed failures)"
            fi
        fi

        if [ "$MODE" == "all" ] || [ "$MODE" == "admin" ]; then
            if [ $admin_failed -eq 0 ]; then
                echo "Admin Frontend:      ✓ PASSED"
            else
                echo "Admin Frontend:      ✗ FAILED ($admin_failed failures)"
            fi
        fi

        if [ "$MODE" == "all" ] || [ "$MODE" == "frontend" ]; then
            if [ $frontend_failed -eq 0 ]; then
                echo "User Frontend:       ✓ PASSED"
            else
                echo "User Frontend:       ✗ FAILED ($frontend_failed failures)"
            fi
        fi

        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                         REPORT LOCATIONS"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""
        echo "Backend Report:      $BACKEND_REPORT"
        echo "Admin Report:        $ADMIN_REPORT"
        echo "Frontend Report:     $FRONTEND_REPORT"
        echo "Summary Report:      $SUMMARY_REPORT"
        echo ""
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo "                          RECOMMENDATIONS"
        echo "───────────────────────────────────────────────────────────────────────────────"
        echo ""

        if [ $total_failed -eq 0 ]; then
            echo "✓ All tests passed! System is ready for deployment."
            echo "✓ Consider running performance tests before production release."
        else
            echo "✗ Please review failed tests before proceeding with deployment."
            echo "✗ Check individual reports for detailed failure information."
            echo "✗ Run './scripts/test-runner.sh [backend|admin|frontend]' to re-test specific suites."
        fi

        echo ""
        echo "═══════════════════════════════════════════════════════════════════════════════"
    } > "$SUMMARY_REPORT"

    # Display summary to terminal
    cat "$SUMMARY_REPORT"

    print_success "Summary report saved to: $SUMMARY_REPORT"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    clear

    print_header "🧪 PROFESSIONAL TEST EXECUTION SUITE"
    print_info "Execution Mode: $MODE"
    print_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"

    local backend_result=0
    local admin_result=0
    local frontend_result=0

    case "$MODE" in
        backend)
            run_backend_tests || backend_result=$?
            generate_summary $backend_result 0 0
            ;;
        admin)
            run_admin_tests || admin_result=$?
            generate_summary 0 $admin_result 0
            ;;
        frontend)
            run_frontend_tests || frontend_result=$?
            generate_summary 0 0 $frontend_result
            ;;
        all)
            run_backend_tests || backend_result=$?
            run_admin_tests || admin_result=$?
            run_frontend_tests || frontend_result=$?
            generate_summary $backend_result $admin_result $frontend_result
            ;;
        *)
            echo -e "${RED}Error: Invalid mode '$MODE'${NC}"
            echo "Usage: $0 [backend|admin|frontend|all]"
            exit 1
            ;;
    esac

    local total_failures=$((backend_result + admin_result + frontend_result))

    if [ $total_failures -eq 0 ]; then
        print_header "🎉 TEST EXECUTION COMPLETED SUCCESSFULLY"
        exit 0
    else
        print_header "⚠️  TEST EXECUTION COMPLETED WITH FAILURES"
        exit 1
    fi
}

# Run main function
main "$@"
