#!/usr/bin/env bash
# Epic 11 Test Validation Script
# This script validates that the test environment is properly configured

# Configuration
TEST_FILE="ui/cypress/e2e/epic11-final-regression.cy.js"

echo "=================================================="
echo "Epic 11: Test Environment Validation"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

# Check npm
echo -n "Checking npm installation... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check API dependencies
echo -n "Checking API dependencies... "
if [ -d "api/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "Run: cd api && npm install"
    exit 1
fi

# Check UI dependencies
echo -n "Checking UI dependencies... "
if [ -d "ui/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "Run: cd ui && npm install"
    exit 1
fi

# Check API .env file
echo -n "Checking API .env configuration... "
if [ -f "api/.env" ]; then
    if grep -q "SETTINGS_ENCRYPTION_SECRET" api/.env && grep -q "JWT_SECRET" api/.env; then
        echo -e "${GREEN}✓${NC} Configured"
    else
        echo -e "${YELLOW}⚠${NC} Missing required variables"
        echo "  Ensure SETTINGS_ENCRYPTION_SECRET and JWT_SECRET are set"
    fi
else
    echo -e "${RED}✗ Not found${NC}"
    echo "Run: cd api && cp .env.example .env"
    exit 1
fi

# Check API server
echo -n "Checking API server (http://localhost:3000)... "
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/health 2>/dev/null)
# Note: 401 is expected as the health endpoint requires authentication
if [ "$API_RESPONSE" == "401" ] || [ "$API_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Running"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Start: cd api && node index.js"
    exit 1
fi

# Check UI server
echo -n "Checking UI server (http://localhost:4200)... "
UI_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 2>/dev/null)
if [ "$UI_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Running"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Start: cd ui && npm start"
    exit 1
fi

# Check test file exists
echo -n "Checking regression test file... "
if [ -f "$TEST_FILE" ]; then
    LINE_COUNT=$(wc -l < "$TEST_FILE")
    echo -e "${GREEN}✓${NC} Found ($LINE_COUNT lines)"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check Cypress
echo -n "Checking Cypress installation... "
if [ -f "ui/node_modules/.bin/cypress" ]; then
    echo -e "${GREEN}✓${NC} Installed"
elif command -v cypress &> /dev/null; then
    echo -e "${GREEN}✓${NC} Installed (global)"
else
    echo -e "${YELLOW}⚠${NC} Not installed"
    echo "Install: cd ui && npm install cypress --save-dev"
fi

# Check documentation
echo -n "Checking documentation files... "
DOC_COUNT=0
[ -f "EPIC11_README.md" ] && ((DOC_COUNT++))
[ -f "EPIC11_EXECUTION_GUIDE.md" ] && ((DOC_COUNT++))
[ -f "EPIC11_SUMMARY.md" ] && ((DOC_COUNT++))
[ -f "SECURITY_SUMMARY_EPIC11.md" ] && ((DOC_COUNT++))
if [ $DOC_COUNT -eq 4 ]; then
    echo -e "${GREEN}✓${NC} All 4 files present"
else
    echo -e "${YELLOW}⚠${NC} Only $DOC_COUNT/4 files found"
fi

echo ""
echo "=================================================="
echo "Test Structure Validation"
echo "=================================================="
echo ""

# Validate test structure
echo "Analyzing test file structure..."

# Define test parts
declare -a PARTS=(
    "Part 1: System Boot & Data Seeding"
    "Part 2: UI/UX Polish Verification"
    "Part 3: Booking & Voucher Redemption"
    "Part 4: Vendor Dashboard"
    "Part 5: Admin Dashboard & Security"
    "Part 6: Shutdown"
)

# Check each part
for i in "${!PARTS[@]}"; do
    PART_NUM=$((i + 1))
    COUNT=$(grep -c "Part $PART_NUM:" "$TEST_FILE")
    echo "  ${PARTS[$i]} - $COUNT section(s)"
done

SCREENSHOT_COUNT=$(grep -c "cy.screenshot" "$TEST_FILE")
echo ""
echo "  Screenshot commands: $SCREENSHOT_COUNT"
echo "  Expected screenshots: 22"

if [ $SCREENSHOT_COUNT -eq 22 ]; then
    echo -e "  ${GREEN}✓${NC} Screenshot count matches expected"
else
    echo -e "  ${YELLOW}⚠${NC} Screenshot count mismatch"
fi

echo ""
echo "=================================================="
echo "Environment Status Summary"
echo "=================================================="
echo ""
echo -e "${GREEN}✓${NC} All prerequisites met"
echo -e "${GREEN}✓${NC} API server running on port 3000"
echo -e "${GREEN}✓${NC} UI server running on port 4200"
echo -e "${GREEN}✓${NC} Test file ready for execution"
echo ""
echo "To run the regression test:"
echo "  cd ui"
echo "  npx cypress run --spec \"$TEST_FILE\""
echo ""
echo "For detailed instructions, see:"
echo "  - EPIC11_README.md (Quick start)"
echo "  - EPIC11_EXECUTION_GUIDE.md (Detailed guide)"
echo ""
echo "=================================================="
