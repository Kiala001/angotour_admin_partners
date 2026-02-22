import { useCallback, useEffect, useState } from "react"

export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await window.fetch(`/api${endpoint}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetch()
  }, [fetch, ...dependencies])

  const refetch = useCallback(() => fetch(), [fetch])

  return { data, isLoading, error, refetch }
}

export async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await window.fetch(`/api${endpoint}`, options)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "API call failed")
  }
  return response.json()
}

export const apiClient = {
  // Partners
  async getPartners() {
    return apiCall<any[]>("GET", "/partners")
  },

  async getPartner(id: string) {
    return apiCall<any>("GET", `/partners?id=${id}`)
  },

  async createPartner(data: any) {
    return apiCall<any>("POST", "/partners", data)
  },

  async updatePartner(id: string, data: any) {
    return apiCall<any>("PUT", "/partners", { id, ...data })
  },

  async blockPartner(id: string, blocked: boolean) {
    return apiCall<any>("POST", `/partners/${id}/block`, { blocked })
  },

  // Plans
  async getPlans() {
    return apiCall<any[]>("GET", "/plans")
  },

  async createPlan(data: any) {
    return apiCall<any>("POST", "/plans", data)
  },

  async updatePlan(id: string, data: any) {
    return apiCall<any>("PUT", "/plans", { id, ...data })
  },

  async deletePlan(id: string) {
    return apiCall<any>("DELETE", `/plans?id=${id}`)
  },

  // Subscriptions
  async getSubscriptions() {
    return apiCall<any[]>("GET", "/subscriptions")
  },

  async createSubscription(data: any) {
    return apiCall<any>("POST", "/subscriptions", { action: "create", ...data })
  },

  async reviewSubscription(id: string, status: string, note?: string, reviewerId?: string) {
    return apiCall<any>("POST", "/subscriptions", {
      action: "review",
      id,
      status,
      note,
      reviewerId,
    })
  },

  // Documents
  async uploadDocument(data: any) {
    return apiCall<any>("POST", "/documents", { action: "upload", ...data })
  },

  async reviewDocument(docId: string, partnerId: string, status: string, note?: string, reviewerId?: string) {
    return apiCall<any>("POST", "/documents", {
      action: "review",
      docId,
      partnerId,
      status,
      note,
      reviewerId,
    })
  },

  // Payment Methods
  async getPaymentMethods() {
    return apiCall<any[]>("GET", "/payment-methods")
  },

  async createPaymentMethod(data: any) {
    return apiCall<any>("POST", "/payment-methods", data)
  },

  async updatePaymentMethod(id: string, data: any) {
    return apiCall<any>("PUT", "/payment-methods", { id, ...data })
  },

  async deletePaymentMethod(id: string) {
    return apiCall<any>("DELETE", `/payment-methods?id=${id}`)
  },

  // Services
  async getServices(partnerId: string) {
    return apiCall<any[]>("GET", `/services?partnerId=${partnerId}`)
  },

  async createService(data: any) {
    return apiCall<any>("POST", "/services", data)
  },

  async updateService(id: string, data: any) {
    return apiCall<any>("PUT", "/services", { id, ...data })
  },

  async deleteService(id: string) {
    return apiCall<any>("DELETE", `/services?id=${id}`)
  },

  // Logs
  async getLogs(limit: number = 100) {
    return apiCall<any[]>("GET", `/logs?limit=${limit}`)
  },

  // Auth
  async loginAdmin(email: string, password: string) {
    return apiCall<any>("POST", "/auth/admin/login", { email, password })
  },

  async registerPartner(data: any) {
    return apiCall<any>("POST", "/auth/partner/register", data)
  },

  async loginPartner(email: string, password: string) {
    return apiCall<any>("POST", "/auth/partner/login", { email, password })
  },
}
