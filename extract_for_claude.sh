#!/bin/bash

# Extract all source files content for Claude AI Knowledge Base
# Script: extract_for_claude.sh
# Purpose: Create a single comprehensive file with all source code content

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OUTPUT_FILE="CLAUDE_AINAK.txt"
PROJECT_ROOT="$(pwd)"

# Print banner
echo -e "${BLUE}🤖 Claude AI Knowledge Extractor${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Check if we're in project root
if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
    echo -e "${RED}❌ Error: This script must be run from the project root directory${NC}"
    echo -e "   Make sure you have package.json and src/ directory"
    exit 1
fi

# Remove existing output file
if [[ -f "${OUTPUT_FILE}" ]]; then
    rm "${OUTPUT_FILE}"
fi

# Function to add file content to output
add_file_content() {
    local file_path="$1"
    local relative_path="${file_path#./}"
    
    if [[ -f "$file_path" ]]; then
        echo -e "${YELLOW}📄 Processing: ${relative_path}${NC}"
        
        # Add separator and file header
        echo "" >> "${OUTPUT_FILE}"
        echo "================================================================================" >> "${OUTPUT_FILE}"
        echo "FILE: ${relative_path}" >> "${OUTPUT_FILE}"
        echo "================================================================================" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
        
        # Add file content
        cat "$file_path" >> "${OUTPUT_FILE}"
        echo "" >> "${OUTPUT_FILE}"
    else
        echo -e "${YELLOW}   ⚠️  File ${relative_path} not found, skipping${NC}"
    fi
}

# Create initial header
echo "# Claude AI Knowledge Base - Teljes Projekt Tartalom" > "${OUTPUT_FILE}"
echo "# Generálva: $(date)" >> "${OUTPUT_FILE}"
echo "# Projekt: $(basename "$PROJECT_ROOT")" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

# Add project overview
echo -e "${YELLOW}📋 Adding project overview...${NC}"
echo "================================================================================" >> "${OUTPUT_FILE}"
echo "PROJEKT ÁTTEKINTÉS" >> "${OUTPUT_FILE}"
echo "================================================================================" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"
echo "Ez egy Next.js alapú politikai website projekt." >> "${OUTPUT_FILE}"
echo "Tartalmazza a teljes forráskódot és konfigurációs fájlokat." >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

# Core configuration files
echo -e "${YELLOW}⚙️  Adding configuration files...${NC}"
CONFIG_FILES=(
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "next.config.mjs"
    "next-env.d.ts"
    "tailwind.config.ts"
    "postcss.config.js"
    ".eslintrc.json"
    "jest.config.mjs"
    "jest.setup.js"
    "middleware.ts"
    ".env.example"
    ".env.production.example"
    ".env.test"
    ".gitignore"
)

for file in "${CONFIG_FILES[@]}"; do
    add_file_content "$file"
done

# Database and schema files
echo -e "${YELLOW}🗄️  Adding database files...${NC}"
if [[ -f "prisma/schema.prisma" ]]; then
    add_file_content "prisma/schema.prisma"
fi

# Find and add all migration files
if [[ -d "prisma/migrations" ]]; then
    find prisma/migrations -name "*.sql" -type f | while read -r file; do
        add_file_content "$file"
    done
fi

# Add seed files
if [[ -f "prisma/seed.ts" ]]; then
    add_file_content "prisma/seed.ts"
fi

# Migration scripts
if [[ -f "migrations/migrate_to_slides.ts" ]]; then
    add_file_content "migrations/migrate_to_slides.ts"
fi

# Source code files - TypeScript and JavaScript files
echo -e "${YELLOW}💻 Adding source code files...${NC}"

# Find all TypeScript, JavaScript, CSS files in src/
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" \) | sort | while read -r file; do
    add_file_content "$file"
done

# Test files
echo -e "${YELLOW}🧪 Adding test files...${NC}"

# Find all test files
find __tests__/ tests/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.test.*" -o -name "*.spec.*" \) 2>/dev/null | sort | while read -r file; do
    add_file_content "$file"
done

# Type definition files
echo -e "${YELLOW}🔧 Adding type definitions...${NC}"
if [[ -d "types" ]]; then
    find types/ -type f \( -name "*.ts" -o -name "*.d.ts" \) | sort | while read -r file; do
        add_file_content "$file"
    done
fi

# Important documentation files
echo -e "${YELLOW}📚 Adding documentation...${NC}"
DOC_FILES=(
    "README.md"
    "HANDOFF_FINAL.md"
    "DEPLOYMENT.md"
    "PERFORMANCE_OPTIMIZATION.md"
    "SERVICE_WORKER_GUIDE.md"
    "VIDEO_COMPRESSION.md"
    "VIDEO_OPTIMIZATION_FINAL_REPORT.md"
    "JAVITASI_NAPLO.md"
    "MINŐSEGBIZTOSITASI_AUDIT_JELENTÉS.md"
    "MINŐSÉGBIZTOSITASI_HANDOFF_2.md"
)

for file in "${DOC_FILES[@]}"; do
    add_file_content "$file"
done

# Public files (exclude images, include important text/config files)
echo -e "${YELLOW}🌐 Adding public configuration files...${NC}"

# Find important public files (not images)
find public/ -type f \( -name "*.html" -o -name "*.txt" -o -name "*.xml" -o -name "*.json" -o -name "*.js" -o -name "*.css" -o -name "*.svg" \) 2>/dev/null | sort | while read -r file; do
    add_file_content "$file"
done

# Test scripts
echo -e "${YELLOW}🚀 Adding utility scripts...${NC}"
if [[ -f "tests/test-posts.sh" ]]; then
    add_file_content "tests/test-posts.sh"
fi

# Any other important shell scripts in the root
find . -maxdepth 1 -name "*.sh" -type f | while read -r file; do
    add_file_content "$file"
done

# Database backup files (SQL content is useful for understanding schema)
echo -e "${YELLOW}💾 Adding important database files...${NC}"
for file in *.sql; do
    if [[ -f "$file" ]] && [[ $(wc -c <"$file") -lt 1000000 ]]; then  # Only if smaller than 1MB
        add_file_content "$file"
    fi
done

# Add final summary
echo "" >> "${OUTPUT_FILE}"
echo "================================================================================" >> "${OUTPUT_FILE}"
echo "ÖSSZEFOGLALÓ" >> "${OUTPUT_FILE}"
echo "================================================================================" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"
echo "Ez a fájl tartalmazza a teljes projekt forráskódját és konfigurációit." >> "${OUTPUT_FILE}"
echo "Generálva: $(date)" >> "${OUTPUT_FILE}"
echo "Projekt gyökér: ${PROJECT_ROOT}" >> "${OUTPUT_FILE}"

# Calculate statistics
FILE_SIZE=$(du -sh "${OUTPUT_FILE}" | cut -f1)
LINE_COUNT=$(wc -l < "${OUTPUT_FILE}" | tr -d ' ')
CHAR_COUNT=$(wc -c < "${OUTPUT_FILE}" | tr -d ' ')

echo "Fájl méret: ${FILE_SIZE}" >> "${OUTPUT_FILE}"
echo "Sorok száma: ${LINE_COUNT}" >> "${OUTPUT_FILE}"
echo "Karakterek száma: ${CHAR_COUNT}" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

# Success message
echo ""
echo -e "${GREEN}🎉 Extraction completed successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "📁 Output file: ${OUTPUT_FILE}"
echo -e "📏 Size: ${FILE_SIZE}"
echo -e "📄 Lines: ${LINE_COUNT}"
echo -e "🔤 Characters: ${CHAR_COUNT}"
echo ""
echo -e "${BLUE}🤖 This file contains all source code and configurations needed for Claude AI${NC}"
echo -e "${BLUE}   Upload this single file to your Claude project knowledge base.${NC}"
echo ""
echo -e "${YELLOW}💡 Note: Images and binary files are excluded to keep the file manageable.${NC}"