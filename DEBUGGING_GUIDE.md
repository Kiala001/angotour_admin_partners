# AngoTour Admin Partners - Debugging & Verification Guide

## Phase 1: Core Backend Fixes - Completed Actions

### 1. Partner Registration Validation
**File**: `app/api/auth/partner/register/route.ts`

**Enhancements Made**:
- Email format validation (regex check)
- Password minimum length validation (8 characters)
- NIF format validation (10-15 digits)
- Unique constraint checks (NIF, email, login email)
- Partner type enumeration validation
- Province validation against PROVINCES list
- City, Bairro, Rua minimum length validation (2 characters)
- Mista type sub-types validation
- Comprehensive error messages with field-specific feedback
- Detailed console logging for debugging

**Testing Command**:
```bash
curl -X POST http://localhost:3000/api/auth/partner/register \
  -H "Content-Type: application/json" \
  -d '{
    "type":"Hotel",
    "companyName":"Hotel Test",
    "nif":"1234567890",
    "phone":"+244923456789",
    "email":"test@hotel.com",
    "loginEmail":"admin@hotel.com",
    "password":"TestPass123",
    "province":"Luanda",
    "city":"Luanda",
    "bairro":"Test",
    "rua":"Test Street"
  }'
```

**Expected Response**:
- Status 201 (Created)
- Returns partner object with ID, email, companyName, type, licenseExpiry, documentsStatus
- Activity log recorded

**Validation Tests to Perform**:
- [ ] Valid registration creates partner
- [ ] Duplicate NIF returns 409 Conflict
- [ ] Invalid email returns 400 Bad Request
- [ ] Weak password returns 400 Bad Request
- [ ] Invalid province returns 400 Bad Request
- [ ] All required fields present
- [ ] Activity log recorded correctly

---

### 2. Admin Registration Endpoint (NEW)
**File**: `app/api/auth/admin/register/route.ts`

**Features**:
- Email validation (format check)
- Password strength validation (minimum 8 characters)
- Name length validation (minimum 2 characters)
- Email uniqueness check
- ID generation with timestamp + random suffix
- Audit logging of admin creation

**Testing Command**:
```bash
curl -X POST http://localhost:3000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newadmin@angotour.com",
    "password":"AdminSecure123",
    "name":"Admin User"
  }'
```

**Expected Response**:
- Status 201 (Created)
- Returns admin object with ID, email, name
- Activity log shows "system" as user creating the log

---

### 3. Registration Data Endpoint (NEW)
**File**: `app/api/auth/registration-data/route.ts`

**Purpose**: Pre-loads all active plans and payment methods for the partner registration form

**Features**:
- Returns only active plans (active: true)
- Returns only active payment methods (active: true)
- Single endpoint to fetch all registration form data
- Used by frontend during registration page load

**Testing Command**:
```bash
curl http://localhost:3000/api/auth/registration-data
```

**Expected Response**:
```json
{
  "plans": [...active plans],
  "paymentMethods": [...active payment methods],
  "success": true
}
```

---

### 4. Document Review Endpoint (NEW)
**File**: `app/api/documents/[id]/review/route.ts`

**Features**:
- Approve or reject documents
- Optional review notes for feedback
- Admin ID tracking for audit trail
- Automatic status propagation to partner document status
- Activity logging of all reviews

**Testing Command**:
```bash
curl -X POST http://localhost:3000/api/documents/{DOC_ID}/review \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId":"partner-123",
    "status":"approved",
    "reviewNote":"Document approved",
    "reviewerId":"admin-1"
  }'
```

**Status Values**: "approved" or "rejected"

---

### 5. Subscription Review Endpoint (NEW)
**File**: `app/api/subscriptions/[id]/review/route.ts`

**Features**:
- Approve or reject partner subscriptions
- When approved: calculates plan expiry and updates partner license info
- Automatic license expiry calculation based on plan duration
- Activity logging of subscription decisions
- Partner blocking/unblocking based on approval status

**Testing Command**:
```bash
curl -X POST http://localhost:3000/api/subscriptions/{SUB_ID}/review \
  -H "Content-Type: application/json" \
  -d '{
    "status":"approved",
    "reviewNote":"Payment verified",
    "reviewerId":"admin-1"
  }'
```

---

## Phase 2: API Testing & Verification

### Complete User Flow Test (Manual Walkthrough)

#### Step 1: Initialize Database
```bash
curl -X POST http://localhost:3000/api/init
```
Expected: Database populated with default admin, plans, payment methods

#### Step 2: Fetch Registration Data
```bash
curl http://localhost:3000/api/auth/registration-data
```
Expected: 3 active plans, 2 active payment methods

#### Step 3: Partner Registration
```bash
# Register first partner
curl -X POST http://localhost:3000/api/auth/partner/register \
  -H "Content-Type: application/json" \
  -d '{
    "type":"Hotel",
    "companyName":"Hotel One",
    "nif":"1111111111",
    "phone":"+244911111111",
    "email":"contact@hoteldone.com",
    "loginEmail":"hotel1@admin.com",
    "password":"HotelPass123",
    "province":"Luanda",
    "city":"Luanda",
    "bairro":"Maianga",
    "rua":"Avenida Principal"
  }'

# Save the partner ID returned: PARTNER_ID_1
```

#### Step 4: Partner Login
```bash
curl -X POST http://localhost:3000/api/auth/partner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hotel1@admin.com","password":"HotelPass123"}'
```
Expected: Returns partner object with documents array

#### Step 5: Verify Partner in Database
```bash
curl http://localhost:3000/api/partners?id={PARTNER_ID_1}
```
Expected: Partner has:
- documentsStatus: "not_uploaded"
- licenseType: "free_trial"
- licenseExpiry: 30 days from now
- documents: [] (empty array)
- blocked: false

#### Step 6: Upload Document
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId":"{PARTNER_ID_1}",
    "type":"Alvara",
    "fileName":"alvara_hotel.pdf"
  }'

# Save document ID: DOC_ID_1
```

#### Step 7: Review Document
```bash
curl -X POST http://localhost:3000/api/documents/{DOC_ID_1}/review \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId":"{PARTNER_ID_1}",
    "status":"approved",
    "reviewNote":"Alvara looks valid"
  }'
```

#### Step 8: Create Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId":"{PARTNER_ID_1}",
    "planId":"plan-starter",
    "receiptFileName":"payment_receipt.pdf"
  }'

# Save subscription ID: SUB_ID_1
```

#### Step 9: Review Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions/{SUB_ID_1}/review \
  -H "Content-Type: application/json" \
  -d '{
    "status":"approved",
    "reviewNote":"Payment confirmed"
  }'
```

#### Step 10: Verify Partner License Updated
```bash
curl http://localhost:3000/api/partners?id={PARTNER_ID_1}
```
Expected: Partner has:
- licenseType: "paid"
- licenseExpiry: 30 days from approval (based on plan duration)
- planId: "plan-starter"
- blocked: false

#### Step 11: Test Partner Block
```bash
curl -X POST http://localhost:3000/api/partners/{PARTNER_ID_1}/block \
  -H "Content-Type: application/json" \
  -d '{"blocked":true}'
```

#### Step 12: Verify Activity Logs
```bash
curl http://localhost:3000/api/logs
```
Expected: Logs show:
- Partner registration
- Document upload
- Document review
- Subscription creation
- Subscription approval
- Partner block

---

## Phase 3: Frontend Integration Verification

### Document Submission Flow
**Needs Testing**:
1. Frontend loads registration data on page mount
2. Plans and payment methods display correctly
3. Form validates before submission
4. Registration success redirects to login
5. Partner can login with new credentials
6. Partner dashboard loads partner data from API
7. Partner can upload documents
8. Document status updates in real-time

### Admin Panel Flow
**Needs Testing**:
1. Admin can view all partners
2. Search/filter works correctly
3. Admin can review documents
4. Admin can approve/reject subscriptions
5. All actions reflected in activity logs

---

## Phase 4: Validation Checklist

### Input Validation
- [x] Partner registration validates all fields
- [x] Admin registration validates email/password
- [x] Document review validates status
- [x] Subscription review validates status
- [ ] Frontend forms validate before API call

### Data Persistence
- [x] Partners saved to db.json
- [x] Documents appended to partner
- [x] Subscriptions saved correctly
- [x] Activity logs recorded
- [ ] Data survives server restart

### Relationship Integrity
- [x] Documents linked to correct partner
- [x] Subscriptions linked to correct partner
- [x] Payment methods linked to plans
- [x] Admins can view all partners
- [x] License expiry calculated correctly

### Error Handling
- [x] Duplicate NIF returns proper error
- [x] Invalid email returns proper error
- [x] Invalid province returns proper error
- [x] Missing fields return specific errors
- [x] 500 errors don't crash server

---

## Debugging Commands

### View Database File
```bash
cat data/db.json | jq '.'
```

### View Last 10 Activity Logs
```bash
curl http://localhost:3000/api/logs | jq '.[:10]'
```

### Count Registered Partners
```bash
curl http://localhost:3000/api/partners | jq 'length'
```

### Find Partner by NIF
```bash
curl http://localhost:3000/api/partners | jq '.[] | select(.nif=="1234567890")'
```

### Check Partner Documents
```bash
curl http://localhost:3000/api/partners?id={PARTNER_ID} | jq '.documents'
```

### View All Subscriptions
```bash
curl http://localhost:3000/api/subscriptions | jq '.'
```

---

## Console Logging Points

When debugging, check browser console for [v0] logs:
- Registration attempt: `[v0] Partner registration attempt: {companyName}`
- Validation failures: `[v0] Missing fields: [...]`
- API errors: `[v0] Error: ...`
- Data fetches: `[v0] Fetched from API: ...`

---

## Next Steps

### Immediate (Critical)
1. Run test script: `bash test-api.sh`
2. Verify all 18 test endpoints work
3. Check database file exists: `ls -la data/db.json`
4. Validate no errors in browser console

### Short Term (This Sprint)
1. Integrate remaining frontend pages
2. Test complete user workflows
3. Verify document upload works
4. Test subscription approval flow

### Medium Term (Next Sprint)
1. Add password hashing (bcrypt)
2. Add rate limiting
3. Performance optimization
4. Security hardening
