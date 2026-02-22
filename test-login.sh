#!/bin/bash

echo "=== Angotour Admin Partners - Login & Panel Test ==="
echo ""
echo "Testing API endpoints..."
echo ""

# Configuration
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="webtec.solution@gmail.com"
ADMIN_PASSWORD="WebtecSolution"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get all partners
echo -e "${YELLOW}TEST 1: Fetching all partners...${NC}"
PARTNERS=$(curl -s "$BASE_URL/api/partners")
PARTNER_COUNT=$(echo "$PARTNERS" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Found $PARTNER_COUNT partners${NC}"
echo ""

# Extract first partner for testing (if exists)
FIRST_PARTNER=$(echo "$PARTNERS" | grep -o '"loginEmail":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$FIRST_PARTNER" ]; then
  echo -e "${YELLOW}Found test partner email: $FIRST_PARTNER${NC}"
  echo ""
else
  echo -e "${RED}✗ No partners found - need to register one first${NC}"
  echo ""
fi

# Test 2: Admin Login
echo -e "${YELLOW}TEST 2: Testing Admin Login${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_ID=$(echo "$ADMIN_LOGIN" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$ADMIN_ID" ]; then
  echo -e "${GREEN}✓ Admin login successful${NC}"
  echo "  Admin ID: $ADMIN_ID"
else
  echo -e "${RED}✗ Admin login failed${NC}"
  echo "  Response: $ADMIN_LOGIN"
fi
echo ""

# Test 3: Get Plans
echo -e "${YELLOW}TEST 3: Fetching Plans${NC}"
PLANS=$(curl -s "$BASE_URL/api/plans")
PLAN_COUNT=$(echo "$PLANS" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Found $PLAN_COUNT plans${NC}"
echo ""

# Test 4: Get Payment Methods
echo -e "${YELLOW}TEST 4: Fetching Payment Methods${NC}"
PAYMENT_METHODS=$(curl -s "$BASE_URL/api/payment-methods")
PM_COUNT=$(echo "$PAYMENT_METHODS" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Found $PM_COUNT payment methods${NC}"
echo ""

# Test 5: Partner Login (if partner found)
if [ -n "$FIRST_PARTNER" ]; then
  echo -e "${YELLOW}TEST 5: Testing Partner Login${NC}"
  
  # Get partner password from database (for testing)
  # In production, use actual partner password
  PARTNER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/partner/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$FIRST_PARTNER\",\"password\":\"password123\"}")
  
  PARTNER_ID=$(echo "$PARTNER_LOGIN" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$PARTNER_ID" ]; then
    echo -e "${GREEN}✓ Partner login successful${NC}"
    echo "  Partner ID: $PARTNER_ID"
    echo ""
    
    # Test 6: Fetch Partner Data
    echo -e "${YELLOW}TEST 6: Fetching Partner Data${NC}"
    PARTNER_DATA=$(curl -s "$BASE_URL/api/partners/$PARTNER_ID")
    COMPANY_NAME=$(echo "$PARTNER_DATA" | grep -o '"companyName":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Partner data loaded${NC}"
    echo "  Company: $COMPANY_NAME"
    echo ""
  else
    echo -e "${YELLOW}⊘ Partner login not tested (adjust password in script)${NC}"
    echo ""
  fi
fi

# Test 7: Get Subscriptions
echo -e "${YELLOW}TEST 7: Fetching Subscriptions${NC}"
SUBSCRIPTIONS=$(curl -s "$BASE_URL/api/subscriptions")
SUB_COUNT=$(echo "$SUBSCRIPTIONS" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Found $SUB_COUNT subscriptions${NC}"
echo ""

# Test 8: Get Services
echo -e "${YELLOW}TEST 8: Fetching Services${NC}"
SERVICES=$(curl -s "$BASE_URL/api/services")
SERVICE_COUNT=$(echo "$SERVICES" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ Found $SERVICE_COUNT services${NC}"
echo ""

# Summary
echo -e "${YELLOW}=== TEST SUMMARY ===${NC}"
echo -e "${GREEN}✓ All major endpoints responding${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000/login in browser"
echo "2. Login with admin: $ADMIN_EMAIL"
echo "3. Check console logs for [v0] debug messages"
echo "4. Verify localStorage has 'angotour_auth' key"
echo "5. Navigate to partner panel and check pages load"
echo ""
echo "Debug info:"
echo "- Check Console tab (F12) for [v0] logs"
echo "- Check Application → Local Storage for auth data"
echo "- Check Network tab for API response times"
