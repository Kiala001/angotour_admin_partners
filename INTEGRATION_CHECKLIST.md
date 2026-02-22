# Frontend Integration Checklist

## Done ✅

- [x] Backend API created (20+ endpoints)
- [x] JSON repository with persistence
- [x] Authentication system (admin + partner)
- [x] Login page connected to API
- [x] Register page connected to API
- [x] Admin partners page dynamic
- [x] Partner dashboard dynamic
- [x] Admin plans page dynamic
- [x] API client hooks created
- [x] TypeScript types defined
- [x] Database initialization endpoint
- [x] Error handling implemented
- [x] Documentation created

## Remaining Pages - Easy Integration

### High Priority

#### 1. Admin Subscriptions (`/app/admin/subscriptions/page.tsx`)
**Current**: Uses `store.state.subscriptions`
**Change to**: Use `apiClient.getSubscriptions()`
**Actions**: Review (approve/reject) via `apiClient.reviewSubscription()`

```diff
- const store = useStore()
+ const [subscriptions, setSubscriptions] = useState([])
+ const subscriptions = await apiClient.getSubscriptions()
+ await apiClient.reviewSubscription(id, status, note)
```

**Time**: ~15 minutes

#### 2. Admin Documents (`/app/admin/documents/page.tsx`)
**Current**: Uses `store.state.partners[].documents`
**Change to**: Use `apiClient.getDocuments()`
**Actions**: Review documents via `apiClient.reviewDocument()`

**Time**: ~15 minutes

#### 3. Partner Documents (`/app/partner/documents/page.tsx`)
**Current**: Uses `store.state.partners[].documents`
**Change to**: Use `apiClient.getDocuments()` with partner ID filter
**Actions**: Upload via `apiClient.uploadDocument()`

**Time**: ~20 minutes

#### 4. Partner Services (`/app/partner/services/page.tsx`)
**Current**: Uses `store.state.services`
**Change to**: Use `apiClient.getServices(partnerId)`
**Actions**: CRUD via `apiClient.createService()`, `updateService()`, etc.

**Time**: ~20 minutes

### Medium Priority

#### 5. Admin Payment Methods (`/app/admin/payment-methods/page.tsx`)
**Actions**: CRUD via `apiClient` payment methods

**Time**: ~15 minutes

#### 6. Partner Payment Methods (`/app/partner/payment-methods/page.tsx`)
**Actions**: View/update via API

**Time**: ~10 minutes

#### 7. Admin Logs (`/app/admin/logs/page.tsx`)
**Actions**: Fetch via `apiClient.getLogs()`

**Time**: ~5 minutes

#### 8. Admin Dashboard (`/app/admin/dashboard/page.tsx`)
**Actions**: Fetch aggregated data from multiple endpoints

**Time**: ~15 minutes

#### 9. Partner Plans (`/app/partner/plans/page.tsx`)
**Actions**: Fetch plans and subscribe via API

**Time**: ~15 minutes

#### 10. Partner Profile (`/app/partner/profile/page.tsx`)
**Actions**: Fetch and update via `apiClient.updatePartner()`

**Time**: ~15 minutes

## Pattern to Follow

### Before (using store)
```typescript
'use client'
import { useStore } from '@/lib/data/store'

export default function Page() {
  const store = useStore()
  const items = store.state.items
  
  const handleCreate = (data) => {
    store.addItem(data)
  }
}
```

### After (using API)
```typescript
'use client'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/use-api'
import { toast } from 'sonner'

export default function Page() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await apiClient.getItems()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [])

  const handleCreate = async (data) => {
    try {
      const newItem = await apiClient.createItem(data)
      setItems([...items, newItem])
      toast.success('Criado com sucesso')
    } catch (err) {
      toast.error('Erro ao criar')
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

## API Client Methods Quick Reference

```typescript
// Auth
apiClient.loginAdmin(email, password)
apiClient.loginPartner(email, password)
apiClient.registerPartner(data)

// Partners
apiClient.getPartners()
apiClient.getPartner(id)
apiClient.blockPartner(id, blocked)

// Plans
apiClient.getPlans()
apiClient.createPlan(data)
apiClient.updatePlan(id, data)
apiClient.deletePlan(id)

// Subscriptions
apiClient.getSubscriptions()
apiClient.createSubscription(data)
apiClient.reviewSubscription(id, status, note)

// Documents
apiClient.getDocuments()
apiClient.uploadDocument(data)
apiClient.reviewDocument(id, status, note)

// Services
apiClient.getServices(partnerId)
apiClient.createService(data)
apiClient.updateService(id, data)
apiClient.deleteService(id)

// Payment Methods
apiClient.getPaymentMethods()
apiClient.createPaymentMethod(data)
apiClient.updatePaymentMethod(id, data)
apiClient.deletePaymentMethod(id)

// Logs
apiClient.getLogs()
```

## Common Patterns

### Fetch and Display
```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetch_ = async () => {
    try {
      const result = await apiClient.getX()
      setData(result)
    } finally {
      setLoading(false)
    }
  }
  fetch_()
}, [])
```

### Create/Update
```typescript
const handleSave = async (formData) => {
  try {
    if (editingId) {
      await apiClient.updateX(editingId, formData)
      toast.success('Actualizado')
    } else {
      await apiClient.createX(formData)
      toast.success('Criado')
    }
    await fetchData() // Refresh list
  } catch (err) {
    toast.error('Erro')
  }
}
```

### Delete with Confirmation
```typescript
const handleDelete = async (id) => {
  if (!confirm('Confirmar eliminação?')) return
  try {
    await apiClient.deleteX(id)
    toast.success('Eliminado')
    await fetchData()
  } catch (err) {
    toast.error('Erro')
  }
}
```

### Filter/Search
```typescript
const filtered = data.filter(item =>
  search === '' || item.name.toLowerCase().includes(search.toLowerCase())
)
```

## Common Issues & Solutions

**Issue**: "Cannot read property 'map' of null"
**Fix**: Add loading check and default to empty array
```typescript
const items = data || []
```

**Issue**: "API call not being made"
**Fix**: Check console for errors, ensure async/await is correct

**Issue**: "Data not updating after creation"
**Fix**: Call `fetchData()` after successful creation to refresh

**Issue**: "Type errors in TypeScript"
**Fix**: Import types from `@/lib/types`
```typescript
import type { Partner, Plan, Subscription } from '@/lib/types'
```

## Testing Your Integration

1. **Login** to see if authentication works
2. **Create items** (plans, services, etc.) and verify in database
3. **Update items** and confirm changes persist
4. **Delete items** and verify removal
5. **Check browser console** for `[v0]` debug logs
6. **Check `data/db.json`** to see all stored data

## Performance Tips

- Use `useCallback` for repeated functions
- Debounce search inputs
- Add loading states
- Implement error boundaries
- Cache results when appropriate
- Use `refetch` instead of hard refreshes

## Deployment Notes

- All API routes are in `/app/api/`
- Database file is `data/db.json`
- Make sure `data/` directory is writable
- Initialize with `POST /api/init` on first deploy
- Consider backup strategy for `data/db.json`

---

**Total integration time**: ~2-3 hours for all remaining pages

**Estimated effort per page**: 15-20 minutes

**Current completion**: 5/15 pages dynamic (~33%)
