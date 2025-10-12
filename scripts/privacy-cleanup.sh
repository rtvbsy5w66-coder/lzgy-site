#!/bin/bash

# Privacy Cleanup Cron Job Script
# Runs daily at 2:00 AM UTC to clean up expired anonymous data

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/privacy-cleanup.log"
LOCK_FILE="/tmp/privacy-cleanup.lock"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S UTC') - $1" | tee -a "$LOG_FILE"
}

# Function to cleanup on exit
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

# Check if script is already running
if [ -f "$LOCK_FILE" ]; then
    log "ERROR: Privacy cleanup is already running (lock file exists)"
    exit 1
fi

# Create lock file
echo $$ > "$LOCK_FILE"

log "=========================================="
log "Starting Privacy Cleanup Job"
log "=========================================="

# Load environment variables
if [ -f "$PROJECT_DIR/.env.local" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs)
    log "Environment variables loaded from .env.local"
else
    log "WARNING: .env.local file not found"
fi

# Check if INTERNAL_API_KEY is set
if [ -z "$INTERNAL_API_KEY" ]; then
    log "ERROR: INTERNAL_API_KEY not found in environment variables"
    exit 1
fi

# Determine the application URL
APP_URL=${NEXT_PUBLIC_BASE_URL:-"http://localhost:3000"}
log "Application URL: $APP_URL"

# Execute privacy cleanup
log "Executing privacy cleanup..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $INTERNAL_API_KEY" \
    -H "Content-Type: application/json" \
    "$APP_URL/api/admin/privacy-cleanup" 2>&1)

# Extract response body and status code
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

log "HTTP Status: $HTTP_STATUS"
log "Response: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
    log "✅ Privacy cleanup completed successfully"
    
    # Update last cleanup timestamp
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        # Update or add LAST_PRIVACY_CLEANUP
        if grep -q "LAST_PRIVACY_CLEANUP" "$PROJECT_DIR/.env.local"; then
            sed -i.bak "s/LAST_PRIVACY_CLEANUP=.*/LAST_PRIVACY_CLEANUP=\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"/" "$PROJECT_DIR/.env.local"
        else
            echo "LAST_PRIVACY_CLEANUP=\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" >> "$PROJECT_DIR/.env.local"
        fi
        log "Updated LAST_PRIVACY_CLEANUP timestamp"
    fi
    
    # Extract cleanup stats from response
    if command -v jq >/dev/null 2>&1; then
        DELETED_SIGNATURES=$(echo "$RESPONSE_BODY" | jq -r '.deletedSignatures // 0' 2>/dev/null || echo "0")
        DELETED_VOTES=$(echo "$RESPONSE_BODY" | jq -r '.deletedVotes // 0' 2>/dev/null || echo "0")
        log "📊 Cleanup Statistics:"
        log "   - Deleted anonymous signatures: $DELETED_SIGNATURES"
        log "   - Deleted anonymous votes: $DELETED_VOTES"
    fi
else
    log "❌ Privacy cleanup failed with status $HTTP_STATUS"
    log "Response: $RESPONSE_BODY"
    exit 1
fi

log "=========================================="
log "Privacy Cleanup Job Completed"
log "=========================================="
log ""