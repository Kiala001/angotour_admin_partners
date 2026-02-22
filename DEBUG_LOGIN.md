# Login & Data Persistence Debug Guide

## Issue Fixed: Login Data Not Persisting

### Problem
When a partner or admin logged in, the data (id, email, name) was not being saved to localStorage or retrieved on page load.

### Root Causes
1. **API Response Format Mismatch** - Partner login API returned data nested in a `partner` object
2. **Auth Provider Missing Fallbacks** - Wasn't handling all possible response fields
3. **Missing `isLoading` Check** - Pages tried to fetch data before user was hydrated

### Solutions Applied

#### 1. Fixed Partner Login API (`/api/auth/partner/login/route.ts`)
- Now returns flat structure: `{ id, email, loginEmail, name, companyName, type }`
- Uses `getAllPartners()` directly from repository instead of fetch
- Returns proper HTTP status codes

#### 2. Enhanced Auth Provider (`components/auth-provider.tsx`)
- Added `authLoading` state tracking
- Proper hydration from localStorage on mount
- Handles both `email` and `loginEmail` fields
- Handles both `name` and `companyName` fields
- Console logs for debugging

#### 3. Updated Dashboard (`app/partner/dashboard/page.tsx`)
- Checks `authLoading` before `user?.id`
- Waits for auth provider to hydrate
- Console logs for debugging data fetching
- Better error handling

## How to Verify

### Step 1: Check Console Logs
Open DevTools (F12) → Console tab and look for `[v0]` logs:

```
[v0] Starting login for: email@example.com
[v0] Partner login API response: { id: "...", email: "...", ... }
[v0] Partner user saved to localStorage: { id, email, name, role }
```

### Step 2: Check LocalStorage
Open DevTools → Application → Local Storage → your domain
Look for key: `angotour_auth`
Value should be JSON: `{ "id": "...", "email": "...", "name": "...", "role": "partner" }`

### Step 3: Test Data Persistence
1. Login with partner credentials
2. Open DevTools → Application → Local Storage
3. Verify data is there
4. Refresh the page
5. Check that data loads without re-login

### Step 4: Test Dashboard Loading
1. Login with partner
2. Check Console for `[v0]` logs during page load
3. Dashboard should show user data within 2-3 seconds
4. Look for logs like: `[v0] Partner data loaded: { companyName: "...", ... }`

## Test Credentials

### Admin (Testing)
- Email: `webtec.solution@gmail.com`
- Password: `WebtecSolution`

### Partners (If any registered)
- Use registration flow or check `/data/db.json` for test partners

## Troubleshooting

### Issue: Still shows "Carregando" forever
1. Open Console (F12)
2. Look for error messages
3. Check if `[v0] Auth still loading...` appears repeatedly
4. Check if API endpoints are responding (check Network tab)

### Issue: User ID not found
1. Console logs should show user object with ID
2. If not, check localStorage - might be missing auth data
3. Try logging in again

### Issue: localStorage empty after login
1. Check if browser allows localStorage (not private browsing)
2. Check Console for errors during login
3. Check network tab to see if login API succeeded (200 status)

## Files Modified
- `/app/api/auth/partner/login/route.ts` - Fixed response format
- `/components/auth-provider.tsx` - Improved persistence & hydration
- `/app/partner/dashboard/page.tsx` - Better loading states & error handling

## Next Steps
After verifying login works:
1. Test Documents page loads properly
2. Test Plans page loads properly
3. Test Profile page loads properly
4. Verify all pages show real data from backend
