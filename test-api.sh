#!/bin/bash

# AngoTour Admin Partners - API Testing Script
# Usage: bash test-api.sh

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "AngoTour Admin Partners - API Tests"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Initialize Database
echo -e "${YELLOW}[1] Initializing Database${NC}"
curl -s -X POST "$BASE_URL/api/init" | jq '.' || echo "Init failed"
echo ""

# 2. Test Admin Login
echo -e "${YELLOW}[2] Testing Admin Login${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@angotour.com","password":"admin123"}')
echo "$ADMIN_LOGIN" | jq '.'
echo ""

# 3. Get Active Plans (for registration form)
echo -e "${YELLOW}[3] Fetching Active Plans${NC}"
PLANS=$(curl -s -X GET "$BASE_URL/api/plans")
echo "$PLANS" | jq '.[] | {id, name, price, durationDays}'
echo ""

# 4. Get Active Payment Methods
echo -e "${YELLOW}[4] Fetching Payment Methods${NC}"
PAYMENT_METHODS=$(curl -s -X GET "$BASE_URL/api/payment-methods")
echo "$PAYMENT_METHODS" | jq '.[] | {id, name, active}'
echo ""

# 5. Get Registration Data (plans + payment methods together)
echo -e "${YELLOW}[5] Fetching Registration Data${NC}"
REG_DATA=$(curl -s -X GET "$BASE_URL/api/auth/registration-data")
echo "$REG_DATA" | jq '.'
echo ""

# 6. Test Partner Registration with Validation
echo -e "${YELLOW}[6] Testing Partner Registration${NC}"
REGISTER_PAYLOAD='{
  "type":"Hotel",
  "companyName":"Hotel Paradise",
  "nif":"1234567890",
  "phone":"+244923456789",
  "email":"contact@hotelparadise.com",
  "loginEmail":"admin@hotelparadise.com",
  "password":"securepass123",
  "province":"Luanda",
  "city":"Luanda",
  "bairro":"Maianga",
  "rua":"Avenida Revolução"
}'

REGISTER=$(curl -s -X POST "$BASE_URL/api/auth/partner/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD")
echo "$REGISTER" | jq '.'
PARTNER_ID=$(echo "$REGISTER" | jq -r '.partner.id // empty')
echo "Extracted Partner ID: $PARTNER_ID"
echo ""

# 7. Test Duplicate NIF Validation
if [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[7] Testing Duplicate NIF Validation (should fail)${NC}"
  DUPLICATE=$(curl -s -X POST "$BASE_URL/api/auth/admin/login" \
    -H "Content-Type: application/json" \
    -d '{"type":"Restaurante","companyName":"Duplicate Restaurant","nif":"1234567890"}')
  echo "$DUPLICATE" | jq '.'
  echo ""
fi

# 8. Get All Partners
echo -e "${YELLOW}[8] Fetching All Partners${NC}"
PARTNERS=$(curl -s -X GET "$BASE_URL/api/partners")
echo "$PARTNERS" | jq '.[] | {id, companyName, type, documentsStatus, blocked}'
echo ""

# 9. Test Partner Login
if [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[9] Testing Partner Login${NC}"
  PARTNER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/partner/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@hotelparadise.com","password":"securepass123"}')
  echo "$PARTNER_LOGIN" | jq '.'
  echo ""
fi

# 10. Get Specific Partner
if [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[10] Fetching Specific Partner${NC}"
  PARTNER=$(curl -s -X GET "$BASE_URL/api/partners?id=$PARTNER_ID")
  echo "$PARTNER" | jq '.'
  echo ""
fi

# 11. Test Document Upload
if [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[11] Testing Document Upload${NC}"
  DOC=$(curl -s -X POST "$BASE_URL/api/documents" \
    -H "Content-Type: application/json" \
    -d "{\"partnerId\":\"$PARTNER_ID\",\"type\":\"Alvara\",\"fileName\":\"alvara.pdf\"}")
  echo "$DOC" | jq '.'
  DOC_ID=$(echo "$DOC" | jq -r '.id // empty')
  echo "Extracted Document ID: $DOC_ID"
  echo ""
fi

# 12. Test Document Review
if [ ! -z "$DOC_ID" ] && [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[12] Testing Document Review (Approve)${NC}"
  REVIEW=$(curl -s -X POST "$BASE_URL/api/documents/$DOC_ID/review" \
    -H "Content-Type: application/json" \
    -d "{\"partnerId\":\"$PARTNER_ID\",\"status\":\"approved\",\"reviewNote\":\"All good\"}")
  echo "$REVIEW" | jq '.'
  echo ""
fi

# 13. Test Subscription Creation
if [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[13] Testing Subscription Creation${NC}"
  PLAN_ID=$(echo "$PLANS" | jq -r '.[0].id // "plan-starter"')
  SUB=$(curl -s -X POST "$BASE_URL/api/subscriptions" \
    -H "Content-Type: application/json" \
    -d "{\"partnerId\":\"$PARTNER_ID\",\"planId\":\"$PLAN_ID\",\"receiptFileName\":\"receipt.pdf\"}")
  echo "$SUB" | jq '.'
  SUB_ID=$(echo "$SUB" | jq -r '.id // empty')
  echo "Extracted Subscription ID: $SUB_ID"
  echo ""
fi

# 14. Test Subscription Review
if [ ! -z "$SUB_ID" ]; then
  echo -e "${YELLOW}[14] Testing Subscription Review (Approve)${NC}"
  SUB_REVIEW=$(curl -s -X POST "$BASE_URL/api/subscriptions/$SUB_ID/review" \
    -H "Content-Type: application/json" \
    -d '{"status":"approved","reviewNote":"Payment verified"}')
  echo "$SUB_REVIEW" | jq '.'
  echo ""
fi

# 15. Test Partner Block
if [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[15] Testing Partner Block${NC}"
  BLOCK=$(curl -s -X POST "$BASE_URL/api/partners/$PARTNER_ID/block" \
    -H "Content-Type: application/json" \
    -d '{"blocked":true}')
  echo "$BLOCK" | jq '.'
  echo ""
fi

# 16. Test Partner Unblock
if [ ! -z "$PARTNER_ID" ]; then
  echo -e "${YELLOW}[16] Testing Partner Unblock${NC}"
  UNBLOCK=$(curl -s -X POST "$BASE_URL/api/partners/$PARTNER_ID/block" \
    -H "Content-Type: application/json" \
    -d '{"blocked":false}')
  echo "$UNBLOCK" | jq '.'
  echo ""
fi

# 17. Get Activity Logs
echo -e "${YELLOW}[17] Fetching Activity Logs${NC}"
LOGS=$(curl -s -X GET "$BASE_URL/api/logs")
echo "$LOGS" | jq '.[] | {timestamp, userType, action, details}'
echo ""

# 18. Test Admin Registration
echo -e "${YELLOW}[18] Testing Admin Registration${NC}"
ADMIN_REG=$(curl -s -X POST "$BASE_URL/api/auth/admin/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"newadmin@angotour.com","password":"newadminpass123","name":"New Admin"}')
echo "$ADMIN_REG" | jq '.'
echo ""

echo -e "${GREEN}=========================================="
echo "All tests completed!"
echo "==========================================${NC}"
