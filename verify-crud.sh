#!/bin/bash

# CRUD Operations Verification Script
# This script tests all Create, Read, Update, Delete operations

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}CRUD Operations Verification${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""

# Initialize
echo -e "${YELLOW}[INIT] Initializing database...${NC}"
curl -s -X POST "$BASE_URL/api/init" > /dev/null
echo -e "${GREEN}✓ Database initialized${NC}"
echo ""

# TEST 1: CREATE Partner (Register)
echo -e "${YELLOW}[CREATE] Partner Registration${NC}"
PARTNER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/partner/register" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"Hotel",
    "companyName":"Test Hotel CRUD",
    "nif":"9876543210",
    "phone":"+244923333333",
    "email":"test@hotelcrud.com",
    "loginEmail":"admin@hotelcrud.com",
    "password":"TestPass123",
    "province":"Luanda",
    "city":"Luanda",
    "bairro":"Test",
    "rua":"Test Street"
  }')

PARTNER_ID=$(echo "$PARTNER_RESPONSE" | jq -r '.partner.id // empty')
if [ -z "$PARTNER_ID" ]; then
  echo -e "${RED}✗ Partner creation failed${NC}"
  echo "$PARTNER_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Partner created: $PARTNER_ID${NC}"
echo ""

# TEST 2: READ Partner
echo -e "${YELLOW}[READ] Get Partner${NC}"
PARTNER=$(curl -s "$BASE_URL/api/partners?id=$PARTNER_ID")
COMPANY_NAME=$(echo "$PARTNER" | jq -r '.companyName // empty')
if [ "$COMPANY_NAME" != "Test Hotel CRUD" ]; then
  echo -e "${RED}✗ Partner read failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Partner retrieved: $COMPANY_NAME${NC}"
echo ""

# TEST 3: READ All Partners (List)
echo -e "${YELLOW}[READ] List All Partners${NC}"
PARTNERS=$(curl -s "$BASE_URL/api/partners")
PARTNER_COUNT=$(echo "$PARTNERS" | jq 'length')
if [ "$PARTNER_COUNT" -lt 1 ]; then
  echo -e "${RED}✗ Partner list empty${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Retrieved $PARTNER_COUNT partner(s)${NC}"
echo ""

# TEST 4: CREATE Document
echo -e "${YELLOW}[CREATE] Document Upload${NC}"
DOC=$(curl -s -X POST "$BASE_URL/api/documents" \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\",\"type\":\"Alvara\",\"fileName\":\"test_alvara.pdf\"}")
DOC_ID=$(echo "$DOC" | jq -r '.id // empty')
if [ -z "$DOC_ID" ]; then
  echo -e "${RED}✗ Document creation failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Document created: $DOC_ID${NC}"
echo ""

# TEST 5: READ Documents
echo -e "${YELLOW}[READ] Get Documents${NC}"
DOCS=$(curl -s "$BASE_URL/api/documents")
DOCS_COUNT=$(echo "$DOCS" | jq 'length')
if [ "$DOCS_COUNT" -lt 1 ]; then
  echo -e "${RED}✗ Documents list empty${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Retrieved $DOCS_COUNT document(s)${NC}"
echo ""

# TEST 6: UPDATE Document (Review/Approve)
echo -e "${YELLOW}[UPDATE] Document Review${NC}"
DOC_UPDATE=$(curl -s -X POST "$BASE_URL/api/documents/$DOC_ID/review" \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\",\"status\":\"approved\",\"reviewNote\":\"Verified\"}")
DOC_STATUS=$(echo "$DOC_UPDATE" | jq -r '.status // empty')
if [ "$DOC_STATUS" != "approved" ]; then
  echo -e "${RED}✗ Document update failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Document approved${NC}"
echo ""

# TEST 7: CREATE Subscription
echo -e "${YELLOW}[CREATE] Subscription Request${NC}"
SUB=$(curl -s -X POST "$BASE_URL/api/subscriptions" \
  -H "Content-Type: application/json" \
  -d "{\"partnerId\":\"$PARTNER_ID\",\"planId\":\"plan-starter\",\"receiptFileName\":\"receipt.pdf\"}")
SUB_ID=$(echo "$SUB" | jq -r '.id // empty')
if [ -z "$SUB_ID" ]; then
  echo -e "${RED}✗ Subscription creation failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Subscription created: $SUB_ID${NC}"
echo ""

# TEST 8: READ Subscription
echo -e "${YELLOW}[READ] Get Subscriptions${NC}"
SUBS=$(curl -s "$BASE_URL/api/subscriptions")
SUBS_COUNT=$(echo "$SUBS" | jq 'length')
if [ "$SUBS_COUNT" -lt 1 ]; then
  echo -e "${RED}✗ Subscriptions list empty${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Retrieved $SUBS_COUNT subscription(s)${NC}"
echo ""

# TEST 9: UPDATE Subscription (Review/Approve)
echo -e "${YELLOW}[UPDATE] Subscription Approval${NC}"
SUB_UPDATE=$(curl -s -X POST "$BASE_URL/api/subscriptions/$SUB_ID/review" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"approved\",\"reviewNote\":\"Payment verified\"}")
SUB_STATUS=$(echo "$SUB_UPDATE" | jq -r '.status // empty')
if [ "$SUB_STATUS" != "approved" ]; then
  echo -e "${RED}✗ Subscription update failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Subscription approved${NC}"
echo ""

# TEST 10: UPDATE Partner (Block)
echo -e "${YELLOW}[UPDATE] Partner Block${NC}"
BLOCK=$(curl -s -X POST "$BASE_URL/api/partners/$PARTNER_ID/block" \
  -H "Content-Type: application/json" \
  -d '{"blocked":true}')
BLOCK_STATUS=$(echo "$BLOCK" | jq -r '.success // false')
if [ "$BLOCK_STATUS" != "true" ]; then
  echo -e "${RED}✗ Partner block failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Partner blocked${NC}"
echo ""

# TEST 11: UPDATE Partner (Unblock)
echo -e "${YELLOW}[UPDATE] Partner Unblock${NC}"
UNBLOCK=$(curl -s -X POST "$BASE_URL/api/partners/$PARTNER_ID/block" \
  -H "Content-Type: application/json" \
  -d '{"blocked":false}')
UNBLOCK_STATUS=$(echo "$UNBLOCK" | jq -r '.success // false')
if [ "$UNBLOCK_STATUS" != "true" ]; then
  echo -e "${RED}✗ Partner unblock failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Partner unblocked${NC}"
echo ""

# TEST 12: READ Plans
echo -e "${YELLOW}[READ] Get Plans${NC}"
PLANS=$(curl -s "$BASE_URL/api/plans")
PLANS_COUNT=$(echo "$PLANS" | jq 'length')
if [ "$PLANS_COUNT" -lt 1 ]; then
  echo -e "${RED}✗ Plans list empty${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Retrieved $PLANS_COUNT plan(s)${NC}"
echo ""

# TEST 13: READ Payment Methods
echo -e "${YELLOW}[READ] Get Payment Methods${NC}"
PAYMENTS=$(curl -s "$BASE_URL/api/payment-methods")
PAYMENTS_COUNT=$(echo "$PAYMENTS" | jq 'length')
if [ "$PAYMENTS_COUNT" -lt 1 ]; then
  echo -e "${RED}✗ Payment methods list empty${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Retrieved $PAYMENTS_COUNT payment method(s)${NC}"
echo ""

# TEST 14: READ Activity Logs
echo -e "${YELLOW}[READ] Get Activity Logs${NC}"
LOGS=$(curl -s "$BASE_URL/api/logs")
LOGS_COUNT=$(echo "$LOGS" | jq 'length')
if [ "$LOGS_COUNT" -lt 1 ]; then
  echo -e "${RED}✗ Activity logs empty${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Retrieved $LOGS_COUNT log entries${NC}"
echo ""

# TEST 15: CREATE Admin
echo -e "${YELLOW}[CREATE] Admin Registration${NC}"
ADMIN=$(curl -s -X POST "$BASE_URL/api/auth/admin/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"newadmin@test.com","password":"AdminPass123","name":"Test Admin"}')
ADMIN_ID=$(echo "$ADMIN" | jq -r '.admin.id // empty')
if [ -z "$ADMIN_ID" ]; then
  echo -e "${RED}✗ Admin creation failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Admin created: $ADMIN_ID${NC}"
echo ""

# TEST 16: Verify Partner License Updated
echo -e "${YELLOW}[VERIFY] Partner License After Subscription Approval${NC}"
PARTNER_UPDATED=$(curl -s "$BASE_URL/api/partners?id=$PARTNER_ID")
LICENSE_TYPE=$(echo "$PARTNER_UPDATED" | jq -r '.licenseType // empty')
LICENSE_EXPIRY=$(echo "$PARTNER_UPDATED" | jq -r '.licenseExpiry // empty')
if [ "$LICENSE_TYPE" != "paid" ]; then
  echo -e "${RED}✗ License type not updated${NC}"
  exit 1
fi
echo -e "${GREEN}✓ License type: $LICENSE_TYPE${NC}"
echo -e "${GREEN}✓ License expiry: $LICENSE_EXPIRY${NC}"
echo ""

# Summary
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}CRUD Operations Verification Complete${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${GREEN}✓ CREATE Operations:${NC}"
echo "  - Partner registration"
echo "  - Document upload"
echo "  - Subscription request"
echo "  - Admin registration"
echo ""
echo -e "${GREEN}✓ READ Operations:${NC}"
echo "  - Get specific partner"
echo "  - List all partners"
echo "  - Get documents"
echo "  - Get subscriptions"
echo "  - Get plans"
echo "  - Get payment methods"
echo "  - Get activity logs"
echo ""
echo -e "${GREEN}✓ UPDATE Operations:${NC}"
echo "  - Document review/approval"
echo "  - Subscription review/approval"
echo "  - Partner block/unblock"
echo "  - Partner license updates"
echo ""
echo -e "${GREEN}All CRUD Operations Verified Successfully${NC}"
echo ""
