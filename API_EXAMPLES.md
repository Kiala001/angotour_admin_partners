# API Integration Examples

## Quick Reference

### Using the `useApi` Hook

```typescript
'use client'
import { useApi } from '@/lib/use-api'
import type { Plan } from '@/lib/types'

export default function PlansPage() {
  const { data: plans, loading, error, refetch } = useApi<Plan[]>('/api/plans')

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      {plans?.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
      <button onClick={refetch}>Actualizar</button>
    </div>
  )
}
```

### Using Direct `apiClient` Calls

```typescript
'use client'
import { apiClient } from '@/lib/use-api'
import { useState } from 'react'

export default function CreatePlan() {
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const plan = await apiClient.createPlan({
        name: 'Premium',
        price: 10000,
        durationDays: 30,
        paymentMethodIds: ['pm-1', 'pm-2'],
        active: true,
        currency: 'AOA'
      })
      console.log('Plano criado:', plan)
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  return <button onClick={handleCreate}>{loading ? 'Criando...' : 'Criar Plano'}</button>
}
```

## Complete Examples

### Partner List with API

```typescript
'use client'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/use-api'
import { toast } from 'sonner'
import type { Partner } from '@/lib/types'

export default function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const data = await apiClient.getPartners()
      setPartners(data)
    } catch (err) {
      console.error('[v0] Error:', err)
      toast.error('Erro ao carregar parceiros')
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (partnerId: string, currentBlocked: boolean) => {
    try {
      await apiClient.blockPartner(partnerId, !currentBlocked)
      await fetchPartners()
      toast.success(currentBlocked ? 'Desbloqueado' : 'Bloqueado')
    } catch (err) {
      toast.error('Erro ao atualizar')
    }
  }

  const filtered = partners.filter(p =>
    search === '' || 
    p.companyName.toLowerCase().includes(search.toLowerCase()) ||
    p.nif.includes(search)
  )

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <input
        placeholder="Pesquisar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.map(partner => (
        <div key={partner.id}>
          <h3>{partner.companyName}</h3>
          <p>{partner.nif}</p>
          <button onClick={() => handleBlock(partner.id, partner.blocked)}>
            {partner.blocked ? 'Desbloquear' : 'Bloquear'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Plan Management with CRUD

```typescript
'use client'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/use-api'
import { toast } from 'sonner'
import type { Plan, PaymentMethod } from '@/lib/types'

export default function PlanManager() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    price: 0,
    durationDays: 30,
    paymentMethodIds: [] as string[],
    active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [plansData, pmsData] = await Promise.all([
        apiClient.getPlans(),
        apiClient.getPaymentMethods()
      ])
      setPlans(plansData)
      setPaymentMethods(pmsData)
    } catch (err) {
      toast.error('Erro ao carregar dados')
    }
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await apiClient.updatePlan(editingId, form)
        toast.success('Plano actualizado')
      } else {
        await apiClient.createPlan(form)
        toast.success('Plano criado')
      }
      await loadData()
      resetForm()
    } catch (err) {
      toast.error('Erro ao guardar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este plano?')) return
    try {
      await apiClient.deletePlan(id)
      toast.success('Plano eliminado')
      await loadData()
    } catch (err) {
      toast.error('Erro ao eliminar')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({
      name: '',
      price: 0,
      durationDays: 30,
      paymentMethodIds: [],
      active: true
    })
  }

  return (
    <div>
      <div>
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
        />
        <input
          type="number"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => setForm({...form, price: Number(e.target.value)})}
        />
        <input
          type="number"
          placeholder="Dias"
          value={form.durationDays}
          onChange={(e) => setForm({...form, durationDays: Number(e.target.value)})}
        />
        
        <div>
          <label>Métodos de Pagamento:</label>
          {paymentMethods.map(pm => (
            <label key={pm.id}>
              <input
                type="checkbox"
                checked={form.paymentMethodIds.includes(pm.id)}
                onChange={(e) => {
                  const ids = e.target.checked
                    ? [...form.paymentMethodIds, pm.id]
                    : form.paymentMethodIds.filter(id => id !== pm.id)
                  setForm({...form, paymentMethodIds: ids})
                }}
              />
              {pm.name}
            </label>
          ))}
        </div>

        <button onClick={handleSave}>
          {editingId ? 'Guardar' : 'Criar'}
        </button>
        {editingId && <button onClick={resetForm}>Cancelar</button>}
      </div>

      <div>
        <h3>Planos Existentes</h3>
        {plans.map(plan => (
          <div key={plan.id}>
            <h4>{plan.name}</h4>
            <p>{plan.price} Kz / {plan.durationDays} dias</p>
            <button onClick={() => {
              setEditingId(plan.id)
              setForm({
                name: plan.name,
                price: plan.price,
                durationDays: plan.durationDays,
                paymentMethodIds: plan.paymentMethodIds,
                active: plan.active
              })
            }}>
              Editar
            </button>
            <button onClick={() => handleDelete(plan.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Subscription Review with API

```typescript
'use client'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/use-api'
import { toast } from 'sonner'
import type { PlanSubscription, Partner, Plan } from '@/lib/types'

export default function SubscriptionReview() {
  const [subscriptions, setSubscriptions] = useState<PlanSubscription[]>([])
  const [partners, setPartners] = useState<Map<string, Partner>>(new Map())
  const [plans, setPlans] = useState<Map<string, Plan>>(new Map())
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [subsData, partsData, plansData] = await Promise.all([
        apiClient.getSubscriptions(),
        apiClient.getPartners(),
        apiClient.getPlans()
      ])
      
      setSubscriptions(subsData)
      setPartners(new Map(partsData.map(p => [p.id, p])))
      setPlans(new Map(plansData.map(p => [p.id, p])))
    } catch (err) {
      toast.error('Erro ao carregar')
    }
  }

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!reviewingId) return
    try {
      await apiClient.reviewSubscription(reviewingId, status, reviewNote || undefined)
      toast.success(status === 'approved' ? 'Aprovado' : 'Rejeitado')
      await loadData()
      setReviewingId(null)
      setReviewNote('')
    } catch (err) {
      toast.error('Erro ao rever')
    }
  }

  const pendingCount = subscriptions.filter(s => s.status === 'pending').length

  return (
    <div>
      <h2>Subscrições Pendentes: {pendingCount}</h2>
      
      {subscriptions
        .filter(s => s.status === 'pending')
        .map(sub => {
          const partner = partners.get(sub.partnerId)
          const plan = plans.get(sub.planId)
          
          return (
            <div key={sub.id}>
              <h3>{partner?.companyName}</h3>
              <p>Plano: {plan?.name}</p>
              <p>Comprovativo: {sub.receiptFileName}</p>
              <button onClick={() => setReviewingId(sub.id)}>
                Rever
              </button>
            </div>
          )
        })}

      {reviewingId && (
        <div>
          <textarea
            placeholder="Nota (opcional)"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
          <button onClick={() => handleReview('approved')}>Aprovar</button>
          <button onClick={() => handleReview('rejected')}>Rejeitar</button>
          <button onClick={() => setReviewingId(null)}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
```

## Error Handling Pattern

```typescript
'use client'
import { apiClient } from '@/lib/use-api'
import { toast } from 'sonner'

export async function safeFetch<T>(
  fn: () => Promise<T>,
  errorMessage = 'Erro ao processar'
): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    console.error('[v0] Error:', err)
    toast.error(errorMessage)
    return null
  }
}

// Usage
const result = await safeFetch(
  () => apiClient.createPlan(data),
  'Erro ao criar plano'
)
if (result) {
  // Handle success
}
```

## Tips & Best Practices

1. **Always use try/catch** when calling API methods
2. **Show loading states** while fetching
3. **Use `[v0]` prefix** for console logs
4. **Toast notifications** for user feedback
5. **Refetch after mutations** to keep UI in sync
6. **Use TypeScript** for type safety
7. **Debounce** search/filter inputs
8. **Handle 404s** for deleted items
9. **Implement pagination** for large lists
10. **Cache responses** with `refetchInterval` option
