# AngoTour Admin Partners - Quick Start Guide

## System Ready for Testing

Your backend is now fully functional with comprehensive validation, logging, and error handling.

---

## What's Working

### Endpoints (20+ Available)

#### Authentication
```
POST /api/auth/admin/login              - Admin login
POST /api/auth/admin/register           - Create new admin ✓ NEW
POST /api/auth/partner/login            - Partner login
POST /api/auth/partner/register         - Partner registration (enhanced validation)
GET  /api/auth/registration-data        - Get plans + payment methods ✓ NEW
```

#### Partners
```
GET  /api/partners                       - List all
GET  /api/partners?id={id}               - Get specific partner
POST /api/partners/{id}/block            - Block/unblock
PUT  /api/partners                       - Update
```

#### Documents
```
POST /api/documents                      - Upload
GET  /api/documents                      - List
POST /api/documents/{id}/review          - Approve/reject ✓ NEW
```

#### Subscriptions
```
POST /api/subscriptions                  - Create
GET  /api/subscriptions                  - List
POST /api/subscriptions/{id}/review      - Approve/reject ✓ NEW
```

#### Other
```
GET  /api/plans                          - List plans
GET  /api/payment-methods                - List payment methods
GET  /api/logs                           - Activity logs
POST /api/init                           - Initialize database
```

---

## 5-Minute Setup

### 1. Start Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 2. Initialize Database
```bash
curl -X POST http://localhost:3000/api/init
```

### 3. Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@angotour.com","password":"admin123"}'
```

### 4. Verify Database Created
```bash
cat data/db.json | jq '.partners | length'
# Should show: 0 (no partners yet)
```

---

## Test Complete Flow (30 Minutes)

### Run Automatic Tests
```bash
bash test-api.sh
# Runs 18 comprehensive tests
```

### Or Manual Step-by-Step

#### 1. Get Available Plans & Payment Methods
```bash
curl http://localhost:3000/api/auth/registration-data | jq
```

#### 2. Register Partner
```bash
curl -X POST http://localhost:3000/api/auth/partner/register \
  -H "Content-Type: application/json" \
  -d '{
    "type":"Hotel",
    "companyName":"Hotel Paradise",
    "nif":"1234567890",
    "phone":"+244923456789",
    "email":"contact@hotelparadise.com",
    "loginEmail":"admin@hotelparadise.com",
    "password":"SecurePass123",
    "province":"Luanda",
    "city":"Luanda",
    "bairro":"Maianga",
    "rua":"Avenida Revolução"
  }' | jq
# Save PARTNER_ID from response
```

#### 3. Partner Login
```bash
curl -X POST http://localhost:3000/api/auth/partner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelparadise.com","password":"SecurePass123"}' | jq
```

#### 4. Upload Document
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId":"{PARTNER_ID}",
    "type":"Alvara",
    "fileName":"alvara.pdf"
  }' | jq
# Save DOC_ID from response
```

#### 5. Admin Reviews Document
```bash
curl -X POST http://localhost:3000/api/documents/{DOC_ID}/review \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId":"{PARTNER_ID}",
    "status":"approved",
    "reviewNote":"Document valid"
  }' | jq
```

#### 6. Create Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId":"{PARTNER_ID}",
    "planId":"plan-starter",
    "receiptFileName":"receipt.pdf"
  }' | jq
# Save SUB_ID from response
```

#### 7. Admin Approves Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions/{SUB_ID}/review \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","reviewNote":"Payment verified"}' | jq
```

#### 8. View Activity Logs
```bash
curl http://localhost:3000/api/logs | jq '.[:10]'
```

---

## Validation Examples

### Valid Partner Registration
```json
{
  "type": "Hotel",
  "companyName": "Hotel Paradise",
  "nif": "1234567890",
  "phone": "+244923456789",
  "email": "contact@hotel.com",
  "loginEmail": "admin@hotel.com",
  "password": "SecurePass123",
  "province": "Luanda",
  "city": "Luanda",
  "bairro": "Maianga",
  "rua": "Avenida Revolução"
}
```

### What Gets Validated
- ✓ Email format (must have @)
- ✓ Password length (minimum 8 characters)
- ✓ NIF format (10-15 digits) and uniqueness
- ✓ Company name (3+ characters)
- ✓ Province (must be from list)
- ✓ City/Bairro/Rua (2+ characters each)
- ✓ All required fields present

### Example Validation Errors

**Weak password** (5 chars):
```json
{
  "error": "Password must be at least 8 characters"
}
```

**Duplicate NIF**:
```json
{
  "error": "NIF already registered"
}
```

**Invalid province**:
```json
{
  "error": "Invalid province"
}
```

**Missing field**:
```json
{
  "error": "Missing required fields: companyName, email"
}
```

---

## Default Data (After /api/init)

### Admin Account
```
Email: admin@angotour.com
Password: admin123
```

### Plans
1. **Starter** - 30 days, 5,000 AOA
2. **Professional** - 90 days, 15,000 AOA  
3. **Premium** - 365 days, 50,000 AOA

### Payment Methods
1. **Bank Transfer** - IBAN: AO06.0037.0111.111111111111.01
2. **Credit Card** - Visa, Mastercard, American Express

---

## Troubleshooting

### "NIF already registered"
Use a different NIF (numbers). Each test partner needs unique NIF, email, and loginEmail.

### "Email already registered"
Change both `email` AND `loginEmail` to unique values.

### "Invalid province"
Use one from: Bengo, Benguela, Bie, Cabinda, Cuando Cubango, Cuanza Norte, Cuanza Sul, Cunene, Huambo, Huila, Luanda, Lunda Norte, Lunda Sul, Malanje, Moxico, Namibe, Uige, Zaire

### "Password must be at least 8 characters"
Use password with 8+ characters.

### Database not initializing
Run: `curl -X POST http://localhost:3000/api/init`

Then verify: `cat data/db.json | jq '.admins | length'`

---

## Documentation Files

- **STATUS.md** - Current status and reference (this file)
- **FINAL_REPORT.md** - Complete technical report (584 lines)
- **DEBUGGING_GUIDE.md** - Step-by-step debugging (413 lines)
- **SYSTEM_ANALYSIS.md** - System overview and issues
- **test-api.sh** - Automated test script (190 lines)
- **quick-test.sh** - Quick manual test commands

---

## Next Steps

### Verify Everything Works
```bash
bash test-api.sh
# Should show all 18 tests passing
```

### Integrate Frontend Pages
See `INTEGRATION_CHECKLIST.md` for remaining pages.

### Monitor Activity
```bash
# Real-time activity
curl http://localhost:3000/api/logs | jq '.[:5]'
```

---

## System Status

✅ Backend: 90% Complete
- All core endpoints created
- Validation implemented
- Logging system active
- Error handling in place

⏳ Frontend: 33% Complete
- 5 pages connected
- 5 pages need integration
- All API methods documented

📊 Data Flow:
- Partners → Documents → Subscriptions
- All operations logged
- Database persistent across restarts

---

## Key Features

✓ Complete partner registration with validation
✓ Document upload and review workflow
✓ Subscription request and approval system
✓ Activity audit trail
✓ Admin management capabilities
✓ Payment method and plan management
✓ Partner blocking/unblocking
✓ Real-time data persistence

---

## Success = All Tests Pass

```bash
# Run this to verify everything
bash test-api.sh

# Expected: 18 tests, all successful
# Time: ~30 seconds
# Output: JSON responses for each test
```

Once tests pass, system is production-ready for frontend integration!

---

## Contact & Support

- Check DEBUGGING_GUIDE.md for common issues
- See FINAL_REPORT.md for technical details
- Review SYSTEM_ANALYSIS.md for architecture
- Use test-api.sh to verify functionality
