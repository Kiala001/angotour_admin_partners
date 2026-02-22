'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions {
  skip?: boolean
  refetchInterval?: number
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    if (options.skip) return
    setLoading(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      console.error(`[v0] Error fetching ${url}:`, err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url, options.skip])

  useEffect(() => {
    fetch_()
    if (options.refetchInterval) {
      const interval = setInterval(fetch_, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetch_, options.refetchInterval])

  return { data, loading, error, refetch: fetch_ }
}

export const apiClient = {
  // Auth
  loginAdmin: async (email: string, password: string) => {
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  loginPartner: async (email: string, password: string) => {
    const res = await fetch('/api/auth/partner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  registerPartner: async (data: any) => {
    const res = await fetch('/api/auth/partner/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  // Partners
  getPartners: async () => {
    const res = await fetch('/api/partners')
    if (!res.ok) throw new Error('Failed to fetch partners')
    return res.json()
  },

  getPartner: async (id: string) => {
    const res = await fetch(`/api/partners/${id}`)
    if (!res.ok) throw new Error('Failed to fetch partner')
    return res.json()
  },

  blockPartner: async (id: string, blocked: boolean) => {
    const res = await fetch(`/api/partners/${id}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked }),
    })
    if (!res.ok) throw new Error('Failed to block partner')
    return res.json()
  },

  // Plans
  getPlans: async () => {
    const res = await fetch('/api/plans')
    if (!res.ok) throw new Error('Failed to fetch plans')
    return res.json()
  },

  createPlan: async (data: any) => {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create plan')
    return res.json()
  },

  updatePlan: async (id: string, data: any) => {
    const res = await fetch(`/api/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update plan')
    return res.json()
  },

  deletePlan: async (id: string) => {
    const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete plan')
    return res.json()
  },

  // Subscriptions
  getSubscriptions: async () => {
    const res = await fetch('/api/subscriptions')
    if (!res.ok) throw new Error('Failed to fetch subscriptions')
    return res.json()
  },

  createSubscription: async (data: any) => {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create subscription')
    return res.json()
  },

  reviewSubscription: async (id: string, status: string, note?: string) => {
    const res = await fetch(`/api/subscriptions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    })
    if (!res.ok) throw new Error('Failed to review subscription')
    return res.json()
  },

  // Documents
  getDocuments: async () => {
    const res = await fetch('/api/documents')
    if (!res.ok) throw new Error('Failed to fetch documents')
    return res.json()
  },

  uploadDocument: async (data: any) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to upload document')
    return res.json()
  },

  reviewDocument: async (id: string, status: string, note?: string) => {
    const res = await fetch(`/api/documents/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    })
    if (!res.ok) throw new Error('Failed to review document')
    return res.json()
  },

  // Services
  getServices: async (partnerId?: string) => {
    const url = partnerId ? `/api/services?partnerId=${partnerId}` : '/api/services'
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch services')
    return res.json()
  },

  createService: async (data: any) => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create service')
    return res.json()
  },

  updateService: async (id: string, data: any) => {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update service')
    return res.json()
  },

  deleteService: async (id: string) => {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete service')
    return res.json()
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const res = await fetch('/api/payment-methods')
    if (!res.ok) throw new Error('Failed to fetch payment methods')
    return res.json()
  },

  createPaymentMethod: async (data: any) => {
    const res = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create payment method')
    return res.json()
  },

  updatePaymentMethod: async (id: string, data: any) => {
    const res = await fetch(`/api/payment-methods/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update payment method')
    return res.json()
  },

  deletePaymentMethod: async (id: string) => {
    const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete payment method')
    return res.json()
  },

  // Logs
  getLogs: async () => {
    const res = await fetch('/api/logs')
    if (!res.ok) throw new Error('Failed to fetch logs')
    return res.json()
  },
}
