#!/bin/bash

# Partner Panel Diagnostic Script
# Tests all partner-related API endpoints and displays results

echo "=========================================="
echo "Partner Panel Diagnostic Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -n "Testing: $description ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [[ $http_code =~ ^(200|201|204)$ ]]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    # Show first 100 chars of response
    if [ ! -z "$body" ]; then
      echo "  Response: ${body:0:100}..."
    fi
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "  Response: $body"
  fi
  echo ""
}

# Test 1: Initialize database
echo -e "${YELLOW}1. Database Initialization${NC}"
test_endpoint "GET" "/api/init" "" "Initialize database"

# Test 2: Plans endpoints
echo -e "${YELLOW}2. Plans API${NC}"
test_endpoint "GET" "/api/plans" "" "Get all plans"

# Test 3: Payment methods
echo -e "${YELLOW}3. Payment Methods API${NC}"
test_endpoint "GET" "/api/payment-methods" "" "Get payment methods"

# Test 4: Partners
echo -e "${YELLOW}4. Partners API${NC}"
test_endpoint "GET" "/api/partners" "" "Get all partners"

# Test 5: Create test partner
echo -e "${YELLOW}5. Partner Registration${NC}"
PARTNER_DATA='{
  "type": "Hotel",
  "companyName": "Test Hotel",
  "nif": "1234567890",
  "phone": "123456789",
  "email": "test@hotel.com",
  "loginEmail": "login@hotel.com",
  "password": "TestPassword123",
  "province": "Luanda",
  "city": "Luanda",
  "bairro": "Maianga",
  "rua": "Rua Test"
}'
test_endpoint "POST" "/api/auth/partner/register" "$PARTNER_DATA" "Register new partner"

# Extract partner ID from response (for next tests)
PARTNER_ID=$(curl -s -X POST -H "Content-Type: application/json" -d "$PARTNER_DATA" "$BASE_URL/api/auth/partner/register" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$PARTNER_ID" ]; then
  echo "Partner ID: $PARTNER_ID"
  echo ""

  # Test 6: Get specific partner
  echo -e "${YELLOW}6. Partner Details${NC}"
  test_endpoint "GET" "/api/partners/$PARTNER_ID" "" "Get partner details"

  # Test 7: Update partner
  echo -e "${YELLOW}7. Update Partner${NC}"
  UPDATE_DATA='{"companyName": "Updated Hotel", "phone": "987654321"}'
  test_endpoint "PATCH" "/api/partners/$PARTNER_ID" "$UPDATE_DATA" "Update partner profile"

  # Test 8: Logs
  echo -e "${YELLOW}8. Activity Logs${NC}"
  test_endpoint "GET" "/api/logs?userId=$PARTNER_ID" "" "Get partner logs"

  # Test 9: Documents
  echo -e "${YELLOW}9. Documents API${NC}"
  DOC_DATA='{
    "partnerId": "'$PARTNER_ID'",
    "type": "License",
    "fileName": "test-license.pdf"
  }'
  test_endpoint "POST" "/api/documents" "$DOC_DATA" "Upload document"

  # Test 10: Subscriptions
  echo -e "${YELLOW}10. Subscriptions API${NC}"
  PLAN_ID=$(curl -s "$BASE_URL/api/plans" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  if [ ! -z "$PLAN_ID" ]; then
    SUB_DATA='{
      "partnerId": "'$PARTNER_ID'",
      "planId": "'$PLAN_ID'",
      "receiptFileName": "payment-proof.pdf"
    }'
    test_endpoint "POST" "/api/subscriptions" "$SUB_DATA" "Create subscription"
  fi
fi

# Summary
echo -e "${YELLOW}=========================================="
echo "Test Summary"
echo "==========================================${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Check the errors above.${NC}"
  exit 1
fi
