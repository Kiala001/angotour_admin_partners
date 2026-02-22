# Partner Panel - Error Loading Fixes

## Problem Summary
Partners saw "Carregando" (loading) screens on Planos, Documentos, Perfil, and Dashboard pages, then errors appeared.

## Root Causes Identified & Fixed

### Issue 1: Database Missing Plans and Payment Methods
**Symptom**: All API calls returned empty arrays  
**Cause**: db.json had empty arrays for plans and payment methods  
**Fix**: Initialized database with default plans and payment methods

```json
"plans": [
  { "id": "plan-monthly", "name": "Mensal", "durationDays": 30, "price": 50000 },
  { "id": "plan-quarterly", "name": "Trimestral", "durationDays": 90, "price": 135000 },
  { "id": "plan-annual", "name": "Anual", "durationDays": 365, "price": 500000 }
],
"paymentMethods": [
  { "id": "pm-mbway", "name": "MB Way", "details": "..." },
  { "id": "pm-banco", "name": "Transferência Bancária", "details": "..." }
]
```

### Issue 2: Pages Didn't Wait for Auth Hydration
**Symptom**: Pages loaded before auth context was ready, `user?.id` was undefined  
**Cause**: Components fetched data immediately without checking `isLoading` from auth provider  
**Fix**: Added auth loading state check in all partner pages:

```typescript
const { user, isLoading: authLoading } = useAuth()

useEffect(() => {
  if (authLoading) return  // Wait for auth to load
  if (!user?.id) {
    setLoading(false)
    return
  }
  fetchData()
}, [user?.id, authLoading])
```

### Issue 3: Poor Error Handling and Debugging
**Symptom**: Components showed generic "Carregando" but never displayed error state  
**Cause**: Missing error state and fallback rendering  
**Fix**: Added error handling to all pages:

```typescript
const [error, setError] = useState<string | null>(null)

// In render
if (error) {
  return <div className="text-destructive">{error}</div>
}

// In fetch
if (partnerRes.ok) { ... }
else {
  setError("Erro ao carregar dados")
}
```

## Files Modified

### 1. `/data/db.json`
- Added complete plans array with 3 plans (Monthly, Quarterly, Annual)
- Added payment methods (MB Way, Bank Transfer)

### 2. `/app/partner/dashboard/page.tsx`
- Added `authLoading` state tracking
- Wait for auth hydration before fetching
- Enhanced error logging with fetch status codes
- Added proper error rendering

### 3. `/app/partner/plans/page.tsx`
- Added `authLoading` and `error` states
- Wait for auth before data fetch
- Enhanced error handling for all 4 API calls
- Safe array filtering with type checks
- Show error message to user

### 4. `/app/partner/documents/page.tsx`
- Added `authLoading` and `error` states
- Wait for auth before data fetch
- Enhanced error logging
- Show error message to user

### 5. `/app/partner/profile/page.tsx`
- Added `authLoading` and `error` states
- Wait for auth before data fetch
- Enhanced error logging
- Show error message to user

## Testing the Fixes

### Step 1: Check Console Logs
1. Open DevTools (F12)
2. Go to Console tab
3. Login with partner credentials
4. Look for `[v0]` prefixed logs showing the data loading sequence

### Step 2: Verify Data Loads
1. Login as partner (email: kialaemanuel@gmail.com, password: CheLseaFCB@1)
2. Navigate to Dashboard → should show partner info
3. Navigate to Planos → should show 3 plans
4. Navigate to Documentos → should show document upload section
5. Navigate to Perfil → should show profile form

### Step 3: Check Network Requests
1. Open DevTools → Network tab
2. Refresh page after login
3. Look for these successful (200) API calls:
   - `/api/partners/[id]` → Returns partner data
   - `/api/plans` → Returns 3 plans
   - `/api/payment-methods` → Returns 2 payment methods
   - `/api/subscriptions` → Returns partner's subscriptions
   - `/api/logs?userId=...` → Returns user activity logs

### Step 4: Verify Error Handling
1. Manually change API URL in Network tab to invalid (e.g., `/api/partners/invalid`)
2. Page should show "Erro ao carregar dados do parceiro" instead of infinite loading
3. Console shows detailed error information

## Common Issues & Solutions

### Issue: "Carregando" never disappears
**Solution**: 
1. Check browser console for `[v0]` logs
2. Verify auth is loaded (look for "Hydrating user" log)
3. Check Network tab for API response status codes
4. If APIs return 500, check backend console for server errors

### Issue: Error message shows but page worked before
**Solution**:
1. Verify db.json exists with plans and payment methods
2. Check if plans are marked as `"active": true` (default)
3. Reload page to force fresh data fetch

### Issue: Profile shows but Planos/Documentos shows error
**Solution**:
1. This usually means plans data is missing
2. Check db.json has non-empty plans array
3. Verify API endpoints respond with arrays, not objects

## Diagnostic Console Commands

```javascript
// Check auth state
localStorage.getItem('angotour_auth')

// Check localStorage for all keys
Object.keys(localStorage).forEach(k => console.log(k, localStorage.getItem(k)))

// Check API response
fetch('/api/plans').then(r => r.json()).then(console.log)
fetch('/api/payment-methods').then(r => r.json()).then(console.log)
fetch('/api/partners/[your-id]').then(r => r.json()).then(console.log)
```

## Timeline of Loading

1. **Page loads** → Show auth loading skeleton
2. **Auth hydrates** (50-100ms) → Logs "Hydrating user from localStorage"
3. **User ID available** → Start data fetch
4. **API calls complete** (100-500ms) → Show partner data
5. **Error** (any step) → Show error message instead of loading

## Notes

- All pages now have consistent loading/error/success UX
- Debug logs prefixed with `[v0]` help troubleshoot issues
- Database is pre-seeded with plans and payment methods
- Auth must be fully hydrated before ANY data fetch attempts
- All API calls now have proper error logging with status codes
