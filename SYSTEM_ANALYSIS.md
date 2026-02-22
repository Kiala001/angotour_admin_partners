# AngoTour Admin Partners - System Analysis & Debugging Plan

## Current Architecture Overview

### Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, JSON file-based database
- **Storage**: `/data/db.json` persistent JSON file
- **Authentication**: Simple JWT-like system via context provider

### Core Data Models
1. **Partner** - Tourism businesses (Hotels, Restaurants, etc.)
2. **Plan** - Subscription plans with payment methods
3. **PlanSubscription** - Partner subscriptions with approval workflow
4. **PaymentMethod** - Payment options for plans
5. **ServiceProduct** - Partner's offerings/products
6. **PartnerDocument** - Uploaded documents (licenses, permits)
7. **Admin** - Administrative users
8. **ActivityLog** - Audit trail of system actions

---

## Identified Issues & Objectives

### 1. Admin Registration & Onboarding
**Issue**: Admin registration flow not yet implemented; need to ensure admin creation is properly logged.
**Objectives**:
- Create admin registration/setup endpoint
- Ensure admin creation triggers activity logs
- Implement admin authentication validation
- Verify admin permissions for partner management

### 2. Partner Registration Process
**Issue**: Registration data needs validation and proper logging; payment methods and plans must load correctly on frontend.
**Objectives**:
- Validate all required registration fields
- Log registration action with proper audit trail
- Ensure frontend receives complete registration response
- Verify partner documents array initializes correctly
- Confirm license expiry (30-day trial) sets properly

### 3. Payment Methods & Plans Loading
**Issue**: Frontend needs to fetch available payment methods and plans during registration and partner setup.
**Objectives**:
- Ensure payment methods API returns active methods only
- Verify plans API returns only active plans
- Test frontend loads plans/payment methods before showing options
- Confirm payment method linking to plans works correctly
- Validate caching/refresh of plan and payment data

### 4. Document Submission & Validation
**Issue**: Partners need to submit specific documents (licenses, permits) with proper status tracking.
**Objectives**:
- Implement document upload endpoint
- Validate document types match partner requirements
- Ensure documents status transitions (pending → approved/rejected)
- Verify document review workflow triggers activity logs
- Confirm rejected documents show review notes to partners

### 5. Partner Management (CRUD Operations)
**Issue**: All partner operations must sync properly between API and frontend.
**Objectives**:
- Test partner creation via registration API
- Verify partner update operations
- Test partner blocking/unblocking
- Confirm all changes persist to JSON database
- Ensure every operation logs activity

### 6. Frontend-Backend Integration Testing
**Issue**: Frontend components must dynamically fetch and display data from backend.
**Objectives**:
- Test login endpoint returns correct user data
- Verify authentication context persists user state
- Ensure all pages fetch fresh data on load
- Test error handling for failed API calls
- Confirm loading states display properly
- Verify data updates reflect immediately on UI

### 7. Activity Logging System
**Issue**: All system actions must be recorded for audit trail.
**Objectives**:
- Log admin login/logout
- Log partner registration
- Log document submissions
- Log document reviews
- Log subscription approvals
- Log admin actions on partners (block/unblock)
- Ensure logs are retrievable and searchable

---

## Critical Missing Endpoints

### Admin Management
- `POST /api/auth/admin/register` - Create new admin (MISSING)

### Document Review
- `POST /api/documents/{id}/review` - Admin review document (MISSING)

### Subscription Approval
- `POST /api/subscriptions/{id}/review` - Review subscription (MISSING)

---

## API Operations Test Matrix

| Operation | Partner | Plan | Payment | Document | Subscription | Log |
|-----------|---------|------|---------|----------|--------------|-----|
| Create | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Update | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Block/Unblock | ✓ | - | - | - | - | - |
| Review/Approve | - | - | - | ✗ | ✗ | - |

---

## Data Validation Checklist

### Partner Registration
- [ ] Type must be valid PartnerType enum
- [ ] Company name must be 3+ characters
- [ ] NIF must be unique and properly formatted
- [ ] Email must be valid format and unique
- [ ] Login email must be unique
- [ ] Password minimum 8 characters
- [ ] Province must be from PROVINCES list
- [ ] City, Bairro, Rua minimum 2 characters each

### Document Upload
- [ ] Document type matches partner requirements
- [ ] File size within limits (max 10MB)
- [ ] File format valid (PDF, JPG, PNG)
- [ ] Status properly initialized to "pending"
- [ ] Upload timestamp recorded correctly

### Subscription
- [ ] Partner ID exists
- [ ] Plan ID exists and active
- [ ] Payment receipt file provided
- [ ] Status workflow: pending → approved/rejected

---

## Testing Commands

```bash
# Initialize database with default data
curl -X POST http://localhost:3000/api/init

# Admin login
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@angotour.com","password":"admin123"}'

# Get all payment methods
curl http://localhost:3000/api/payment-methods

# Get all plans
curl http://localhost:3000/api/plans

# Get all partners
curl http://localhost:3000/api/partners

# Get all logs
curl http://localhost:3000/api/logs
```

---

## Priority Fixes

### Must Fix (Critical Path)
1. Add admin registration endpoint with logging
2. Add document review workflow endpoints
3. Add subscription approval/rejection endpoints
4. Validate all input data on registration
5. Test complete registration flow
6. Test document upload and review flow
7. Verify all CRUD operations persist correctly

### Should Fix (High Priority)
1. Integrate remaining frontend pages
2. Implement consistent error handling
3. Add data refresh mechanisms
4. Test complete user workflows

### Nice to Have (Medium Priority)
1. Add password hashing
2. Add rate limiting
3. Optimize database queries
4. Add caching layer
