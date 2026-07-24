#!/bin/bash

# Test Verification Script for icongener Application
# This script verifies that all test files are properly created and structured

echo "🔍 Verifying Test Files..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
UNIT_TESTS=0
E2E_TESTS=0
PASS_COUNT=0
FAIL_COUNT=0

# Function to check if file exists and has content
check_file() {
    local file_path=$1
    local file_type=$2
    
    if [ -f "$file_path" ]; then
        local line_count=$(wc -l < "$file_path")
        if [ $line_count -gt 10 ]; then
            echo -e "${GREEN}✓${NC} $file_path ($line_count lines)"
            ((PASS_COUNT++))
            return 0
        else
            echo -e "${RED}✗${NC} $file_path (only $line_count lines - too short)"
            ((FAIL_COUNT++))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $file_path (missing)"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo ""
echo "📁 Unit Test Files:"
echo "-------------------"

# Check unit test files
UNIT_FILES=(
    "src/app/app.component.spec.ts"
    "src/app/core/services/__tests__/ai.service.spec.ts"
    "src/app/core/services/__tests__/download.service.spec.ts"
    "src/app/core/services/__tests__/progress.service.spec.ts"
    "src/app/core/services/__tests__/toast.service.spec.ts"
    "src/app/core/services/__tests__/icon-generator.service.spec.ts"
    "src/app/layout/__tests__/main-layout.component.spec.ts"
    "src/app/shared/components/__tests__/sidebar.component.spec.ts"
    "src/app/shared/components/__tests__/header.component.spec.ts"
    "src/app/shared/components/__tests__/logo.component.spec.ts"
)

for file in "${UNIT_FILES[@]}"; do
    check_file "$file" "unit"
    ((TOTAL_FILES++))
    ((UNIT_TESTS++))
done

echo ""
echo "🌐 E2E Test Files:"
echo "----------------"

# Check e2e test files
E2E_FILES=(
    "e2e/tests/navigation.spec.ts"
    "e2e/tests/icon-generator.spec.ts"
    "e2e/tests/favicon-generator.spec.ts"
    "e2e/tests/banner-generator.spec.ts"
    "e2e/tests/png-to-html.spec.ts"
    "e2e/tests/history.spec.ts"
    "e2e/tests/settings.spec.ts"
    "e2e/tests/global.spec.ts"
)

for file in "${E2E_FILES[@]}"; do
    check_file "$file" "e2e"
    ((TOTAL_FILES++))
    ((E2E_TESTS++))
done

echo ""
echo "⚙️  Configuration Files:"
echo "------------------------"

# Check configuration files
CONFIG_FILES=(
    "e2e/playwright.config.ts"
    "e2e/package.json"
    "e2e/.env"
    "e2e/.gitignore"
    "e2e/tests/README.md"
    "TEST_SUMMARY.md"
)

for file in "${CONFIG_FILES[@]}"; do
    check_file "$file" "config"
    ((TOTAL_FILES++))
done

echo ""
echo "=========================================="
echo "📊 Summary:"
echo "=========================================="
echo -e "Total files checked: ${TOTAL_FILES}"
echo -e "Unit test files: ${UNIT_TESTS}"
echo -e "E2E test files: ${E2E_TESTS}"
echo -e "Configuration files: $((TOTAL_FILES - UNIT_TESTS - E2E_TESTS))"
echo -e "Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "Failed: ${RED}${FAIL_COUNT}${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All test files are properly created!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some test files are missing or incomplete${NC}"
    exit 1
fi
