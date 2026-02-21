"use client"

import { createContext, useContext } from "react"
import type {
  AppState,
  Partner,
  Plan,
  PlanSubscription,
  PaymentMethod,
  ServiceProduct,
  ActivityLog,
  PartnerDocument,
} from "@/lib/types"
import { getInitialState } from "./seed"

const STORAGE_KEY = "angotour_data"

export function loadState(): AppState {
  if (typeof window === "undefined") return getInitialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    // ignore
  }
  const initial = getInitialState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export interface StoreActions {
  state: AppState
  // Partners
  addPartner: (p: Omit<Partner, "id" | "createdAt" | "documents" | "documentsStatus" | "licenseType" | "licenseExpiry" | "blocked">) => Partner
  updatePartner: (id: string, data: Partial<Partner>) => void
  getPartner: (id: string) => Partner | undefined
  blockPartner: (id: string, blocked: boolean) => void
  // Documents
  addDocument: (doc: Omit<PartnerDocument, "id" | "uploadedAt" | "status">) => void
  updateDocument: (partnerId: string, docType: string, fileName: string, fileData?: string, fileSize?: number) => void
  reviewDocument: (docId: string, partnerId: string, status: "approved" | "rejected", note?: string, reviewerId?: string) => void
  // Plans
  addPlan: (p: Omit<Plan, "id">) => void
  updatePlan: (id: string, data: Partial<Plan>) => void
  deletePlan: (id: string) => void
  // Subscriptions
  addSubscription: (s: Omit<PlanSubscription, "id" | "createdAt" | "status">) => void
  reviewSubscription: (id: string, status: "approved" | "rejected", note?: string, reviewerId?: string) => void
  // Payment Methods
  addPaymentMethod: (pm: Omit<PaymentMethod, "id">) => void
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => void
  deletePaymentMethod: (id: string) => void
  // Services
  addService: (s: Omit<ServiceProduct, "id" | "createdAt">) => void
  updateService: (id: string, data: Partial<ServiceProduct>) => void
  deleteService: (id: string) => void
  // Logs
  addLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void
  // Utility
  reload: () => void
  resetStore: () => void
}

export function createActions(state: AppState, setState: (s: AppState) => void): StoreActions {
  const save = (s: AppState) => {
    saveState(s)
    setState(s)
  }

  return {
    state,

    addPartner: (data) => {
      const trialExpiry = new Date()
      trialExpiry.setDate(trialExpiry.getDate() + 30)
      const partner: Partner = {
        ...data,
        id: genId("partner"),
        createdAt: new Date().toISOString(),
        documents: [],
        documentsStatus: "not_uploaded",
        licenseType: "free_trial",
        licenseExpiry: trialExpiry.toISOString(),
        blocked: false,
      }
      const next = { ...state, partners: [...state.partners, partner] }
      save(next)
      return partner
    },

    updatePartner: (id, data) => {
      const next = {
        ...state,
        partners: state.partners.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }
      save(next)
    },

    getPartner: (id) => state.partners.find((p) => p.id === id),

    blockPartner: (id, blocked) => {
      const next = {
        ...state,
        partners: state.partners.map((p) => (p.id === id ? { ...p, blocked } : p)),
      }
      save(next)
    },

    addDocument: (doc) => {
      const newDoc: PartnerDocument = {
        ...doc,
        id: genId("doc"),
        uploadedAt: new Date().toISOString(),
        status: "pending",
      }
      const next = {
        ...state,
        partners: state.partners.map((p) => {
          if (p.id !== doc.partnerId) return p
          // Check if a document of this type already exists (resubmission)
          const existingIdx = p.documents.findIndex((d) => d.type === doc.type)
          if (existingIdx >= 0) {
            const docs = [...p.documents]
            docs[existingIdx] = {
              ...docs[existingIdx],
              fileName: doc.fileName,
              fileData: doc.fileData,
              fileSize: doc.fileSize,
              status: "pending" as const,
              uploadedAt: new Date().toISOString(),
              reviewNote: undefined,
              reviewedBy: undefined,
            }
            return { ...p, documents: docs, documentsStatus: "pending" as const }
          }
          return {
            ...p,
            documents: [...p.documents, newDoc],
            documentsStatus: "pending" as const,
          }
        }),
      }
      save(next)
    },

    updateDocument: (partnerId, docType, fileName, fileData, fileSize) => {
      const next = {
        ...state,
        partners: state.partners.map((p) => {
          if (p.id !== partnerId) return p
          const existingIdx = p.documents.findIndex((d) => d.type === docType)
          if (existingIdx >= 0) {
            const docs = [...p.documents]
            docs[existingIdx] = {
              ...docs[existingIdx],
              fileName,
              fileData,
              fileSize,
              status: "pending" as const,
              uploadedAt: new Date().toISOString(),
              reviewNote: undefined,
              reviewedBy: undefined,
            }
            return { ...p, documents: docs, documentsStatus: "pending" as const }
          }
          return p
        }),
      }
      save(next)
    },

    reviewDocument: (docId, partnerId, status, note, reviewerId) => {
      const next = {
        ...state,
        partners: state.partners.map((p) => {
          if (p.id !== partnerId) return p
          const docs = p.documents.map((d) =>
            d.id === docId ? { ...d, status, reviewNote: note, reviewedBy: reviewerId } : d
          )
          const allApproved = docs.length > 0 && docs.every((d) => d.status === "approved")
          const anyRejected = docs.some((d) => d.status === "rejected")
          return {
            ...p,
            documents: docs,
            documentsStatus: allApproved ? "approved" as const : anyRejected ? "rejected" as const : "pending" as const,
          }
        }),
      }
      save(next)
    },

    addPlan: (data) => {
      const plan: Plan = { ...data, id: genId("plan") }
      save({ ...state, plans: [...state.plans, plan] })
    },

    updatePlan: (id, data) => {
      save({ ...state, plans: state.plans.map((p) => (p.id === id ? { ...p, ...data } : p)) })
    },

    deletePlan: (id) => {
      save({ ...state, plans: state.plans.filter((p) => p.id !== id) })
    },

    addSubscription: (data) => {
      const sub: PlanSubscription = {
        ...data,
        id: genId("sub"),
        createdAt: new Date().toISOString(),
        status: "pending",
      }
      save({ ...state, subscriptions: [...state.subscriptions, sub] })
    },

    reviewSubscription: (id, status, note, reviewerId) => {
      const next = { ...state }
      next.subscriptions = next.subscriptions.map((s) => {
        if (s.id !== id) return s
        const updated = { ...s, status, reviewNote: note, reviewedBy: reviewerId }
        if (status === "approved") {
          const plan = state.plans.find((p) => p.id === s.planId)
          if (plan) {
            const start = new Date()
            const expires = new Date()
            expires.setDate(expires.getDate() + plan.durationDays)
            updated.startDate = start.toISOString()
            updated.expiresAt = expires.toISOString()
            next.partners = next.partners.map((p) =>
              p.id === s.partnerId
                ? { ...p, licenseType: "paid" as const, licenseExpiry: expires.toISOString(), planId: plan.id, blocked: false }
                : p
            )
          }
        }
        return updated
      })
      save(next)
    },

    addPaymentMethod: (data) => {
      save({ ...state, paymentMethods: [...state.paymentMethods, { ...data, id: genId("pm") }] })
    },

    updatePaymentMethod: (id, data) => {
      save({
        ...state,
        paymentMethods: state.paymentMethods.map((pm) => (pm.id === id ? { ...pm, ...data } : pm)),
      })
    },

    deletePaymentMethod: (id) => {
      save({ ...state, paymentMethods: state.paymentMethods.filter((pm) => pm.id !== id) })
    },

    addService: (data) => {
      save({
        ...state,
        services: [...state.services, { ...data, id: genId("svc"), createdAt: new Date().toISOString() }],
      })
    },

    updateService: (id, data) => {
      save({ ...state, services: state.services.map((s) => (s.id === id ? { ...s, ...data } : s)) })
    },

    deleteService: (id) => {
      save({ ...state, services: state.services.filter((s) => s.id !== id) })
    },

    addLog: (data) => {
      save({
        ...state,
        logs: [{ ...data, id: genId("log"), timestamp: new Date().toISOString() }, ...state.logs],
      })
    },

    reload: () => {
      setState(loadState())
    },

    resetStore: () => {
      const initial = getInitialState()
      saveState(initial)
      setState(initial)
    },
  }
}

export const StoreContext = createContext<StoreActions | null>(null)

export function useStore(): StoreActions {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
