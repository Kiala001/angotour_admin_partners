# Angotour - Login Credentials

## Administrator Credentials

**Email:** `webtec.solution@gmail.com`  
**Password:** `WebtecSolution`

**Type:** Admin  
**Access:** Full system access

---

## Test Partner Credentials

**Email (Login):** `kialaemanuel@gmail.com`  
**Password:** `CheLseaFCB@1`

**Partner Name:** IK Food  
**Type:** Restaurant  
**Access:** Partner panel (Dashboard, Plans, Documents, Profile)

---

## How to Test

### 1. Admin Login
- Navigate to login page
- Enter admin email and password
- You'll have access to:
  - Partner management
  - Document approval
  - Plan management
  - Payment methods
  - Statistics and monitoring

### 2. Partner Login
- Navigate to login page
- Enter partner email and password
- You'll have access to:
  - Dashboard (with company metrics)
  - Plans (subscribe/change plans)
  - Documents (upload Alvará)
  - Profile (edit company information)

---

## What Was Fixed

✓ **Next.js 16 Params Issue** - Changed `params.id` to `await params` for dynamic route handler
✓ **Debug Logging Enhanced** - Added comprehensive console logs to trace ID retrieval
✓ **Error Messages Detailed** - API now returns detailed error info for troubleshooting

## Testing Steps

1. **Admin Panel**
   - Login with admin credentials
   - Navigate to partner management
   - Verify you can see partner "IK Food"

2. **Partner Panel**
   - Login with partner credentials
   - Dashboard should load partner data immediately
   - Check all pages: Plans, Documents, Profile

3. **DevTools Console**
   - Open F12 → Console
   - Look for `[v0]` debug logs
   - Should show ID being retrieved correctly
