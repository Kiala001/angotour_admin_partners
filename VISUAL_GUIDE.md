# Integration Visual Guide

## Current Data Flow

### Before Integration
```
┌──────────────┐
│  React Page  │
└──────┬───────┘
       │
       └──→ localStorage (in-memory only)
            (data lost on refresh)
```

### After Integration
```
┌──────────────────────────────────┐
│     React Component              │
│  (Login, Dashboard, etc.)        │
└──────────────┬────────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  apiClient / useApi Hook         │
│  (lib/use-api.ts)                │
│  ┌─────────────────────────────┐ │
│  │ GET /api/partners           │ │
│  │ POST /api/plans             │ │
│  │ etc...                      │ │
│  └─────────────────────────────┘ │
└──────────────┬────────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  Next.js Route Handlers          │
│  (/app/api/*)                    │
│  ┌─────────────────────────────┐ │
│  │ routes.ts (request handler) │ │
│  │ validation, auth, logic     │ │
│  └─────────────────────────────┘ │
└──────────────┬────────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  Repository Layer                │
│  (lib/db/repository.ts)          │
│  ┌─────────────────────────────┐ │
│  │ read() / write()            │ │
│  │ getPartners() / addPlan()   │ │
│  │ deleteService() etc.        │ │
│  └─────────────────────────────┘ │
└──────────────┬────────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  Persistent JSON File            │
│  (data/db.json)                  │
│  ┌─────────────────────────────┐ │
│  │ {                           │ │
│  │   "partners": [...],        │ │
│  │   "plans": [...],           │ │
│  │   "subscriptions": [...]    │ │
│  │ }                           │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
     Data persists forever ✅
```

## Page Integration Steps

### Before Integration (using localStorage)
```typescript
'use client'
import { useStore } from '@/lib/data/store'

export default function PlansPage() {
  const store = useStore()
  
  const plans = store.state.plans // from localStorage
  
  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
    </div>
  )
}
```

### After Integration (using API)
```typescript
'use client'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/use-api'

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await apiClient.getPlans()
        setPlans(data)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
    </div>
  )
}
```

## Feature Comparison

### localStorage Approach (Before)
❌ Data lost on page refresh
❌ No server persistence
❌ No backend validation
❌ All logic in frontend
❌ Cannot scale easily

### API + JSON Approach (After)
✅ Data persists on server
✅ Real database layer
✅ Server-side validation
✅ Clean separation of concerns
✅ Ready to scale to PostgreSQL

## API Endpoint Matrix

```
Resource      │ GET        │ POST       │ PATCH      │ DELETE
──────────────┼────────────┼────────────┼────────────┼─────────
/partners     │ ✅ List    │ ❌ N/A     │ ❌ N/A     │ ❌ N/A
/partners/:id │ ✅ One     │ ❌ N/A     │ ✅ Block   │ ❌ N/A
/plans        │ ✅ List    │ ✅ Create  │ ❌ N/A     │ ❌ N/A
/plans/:id    │ ✅ One     │ ❌ N/A     │ ✅ Update  │ ✅ Delete
/subscriptions│ ✅ List    │ ✅ Create  │ ❌ N/A     │ ❌ N/A
/subscriptions│ ❌ N/A     │ ❌ N/A     │ ✅ Review  │ ❌ N/A
/:id/review   │            │            │            │
/services     │ ✅ List    │ ✅ Create  │ ❌ N/A     │ ❌ N/A
/services/:id │ ✅ One     │ ❌ N/A     │ ✅ Update  │ ✅ Delete
/documents    │ ✅ List    │ ✅ Upload  │ ❌ N/A     │ ❌ N/A
/documents/:id│ ❌ N/A     │ ❌ N/A     │ ✅ Review  │ ❌ N/A
/auth/*       │ ❌ N/A     │ ✅ Auth    │ ❌ N/A     │ ❌ N/A
```

## Integration Workflow

### Step-by-Step for Each Page

```
1. IDENTIFY
   ↓
   What data does page use?
   - store.state.plans
   - store.state.partners
   - etc.

2. FIND MATCHING API
   ↓
   apiClient.getPlans()
   apiClient.getPartners()
   etc.

3. CREATE STATE
   ↓
   const [plans, setPlans] = useState([])
   const [loading, setLoading] = useState(true)

4. FETCH IN useEffect
   ↓
   useEffect(() => {
     fetchData()
   }, [])

5. HANDLE MUTATIONS
   ↓
   const handleCreate = async (data) => {
     await apiClient.createPlan(data)
     await fetchData() // Refresh
   }

6. REMOVE STORE IMPORTS
   ↓
   Delete: import { useStore } from '@/lib/data/store'
```

## Time Investment

```
Component Analysis      →  5 min
API Method Lookup       →  5 min
State & Effect Setup    →  5 min
Handle Mutations        →  5 min
Testing & Debug         → 10 min
                        ────────
Total per page        →  30 min
```

## Data Type Examples

### Partner
```typescript
{
  "id": "partner-12345",
  "companyName": "Hotel ABC",
  "nif": "00123456789012",
  "type": "Hotel",
  "email": "hotel@example.com",
  "phone": "923456789",
  "blocked": false,
  "licenseExpiry": "2025-03-22T00:00:00Z",
  "documentsStatus": "approved",
  "createdAt": "2025-02-22T10:30:00Z",
  "documents": [...]
}
```

### Plan
```typescript
{
  "id": "plan-1",
  "name": "Professional",
  "price": 15000,
  "currency": "AOA",
  "durationDays": 30,
  "paymentMethodIds": ["pm-1", "pm-2"],
  "active": true
}
```

### Subscription
```typescript
{
  "id": "sub-12345",
  "partnerId": "partner-12345",
  "planId": "plan-1",
  "status": "approved",
  "receiptFileName": "receipt_123.pdf",
  "createdAt": "2025-02-22T10:30:00Z",
  "startDate": "2025-02-22T00:00:00Z",
  "expiresAt": "2025-03-23T00:00:00Z"
}
```

## Error Handling Pattern

```
Try-Catch Block
    ↓
    ├─→ Network Error
    │   └─→ Toast: "Erro ao conectar"
    │
    ├─→ Validation Error (4xx)
    │   └─→ Toast: "Dados invalidos"
    │
    ├─→ Server Error (5xx)
    │   └─→ Toast: "Erro no servidor"
    │
    └─→ Unknown Error
        └─→ Toast: "Erro desconhecido"

Console: console.log("[v0] Error:", err)
```

## Complete Integration Example

### Original Code
```typescript
const store = useStore()
const plans = store.state.plans

const handleCreate = (data) => {
  store.addPlan(data)
}
```

### Integrated Code
```typescript
'use client'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/use-api'
import { toast } from 'sonner'
import type { Plan } from '@/lib/types'

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const data = await apiClient.getPlans()
      setPlans(data)
    } catch (err) {
      console.error('[v0] Error:', err)
      toast.error('Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      await apiClient.createPlan(data)
      toast.success('Plano criado')
      await fetchPlans()
    } catch (err) {
      console.error('[v0] Error:', err)
      toast.error('Erro ao criar plano')
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
      <button onClick={() => handleCreate({ name: 'New' })}>
        Create
      </button>
    </div>
  )
}
```

## Migration Checklist Per Page

- [ ] Remove `useStore` import
- [ ] Remove `import { useStore } from '@/lib/data/store'`
- [ ] Add `import { apiClient } from '@/lib/use-api'`
- [ ] Add `useState` for data
- [ ] Add `useEffect` for fetching
- [ ] Update mutations to use API
- [ ] Add `toast` notifications
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Test all CRUD operations
- [ ] Verify console logs `[v0]`
- [ ] Check `data/db.json` for persistence

---

Your backend is ready! Each page is a straightforward conversion. 🚀
