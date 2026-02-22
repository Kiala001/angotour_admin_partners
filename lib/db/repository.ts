import { promises as fs } from "fs"
import path from "path"
import type {
  AppState,
  Partner,
  Plan,
  PlanSubscription,
  PaymentMethod,
  ServiceProduct,
  ActivityLog,
  PartnerDocument,
  Admin,
} from "@/lib/types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "db.json")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // ignore if already exists
  }
}

// Generate unique IDs
function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// Default initial state
function getInitialState(): AppState {
  return {
    partners: [],
    plans: [],
    subscriptions: [],
    paymentMethods: [],
    services: [],
    admins: [
      {
        id: "admin-1",
        email: "admin@angotour.com",
        password: "admin123", // In production, use bcrypt
        name: "Admin",
      },
    ],
    logs: [],
  }
}

// Load state from JSON file
export async function loadState(): Promise<AppState> {
  await ensureDataDir()
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(data) as AppState
  } catch {
    // File doesn't exist or is invalid, create initial state
    const initial = getInitialState()
    await saveState(initial)
    return initial
  }
}

// Save state to JSON file
export async function saveState(state: AppState): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), "utf-8")
}

// Partner operations
export async function addPartner(
  data: Omit<Partner, "id" | "createdAt" | "documents" | "documentsStatus" | "licenseType" | "licenseExpiry" | "blocked">
): Promise<Partner> {
  const state = await loadState()
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
  
  state.partners.push(partner)
  await saveState(state)
  return partner
}

export async function updatePartner(id: string, data: Partial<Partner>): Promise<void> {
  const state = await loadState()
  const index = state.partners.findIndex((p) => p.id === id)
  if (index !== -1) {
    state.partners[index] = { ...state.partners[index], ...data }
    await saveState(state)
  }
}

export async function getPartner(id: string): Promise<Partner | undefined> {
  const state = await loadState()
  return state.partners.find((p) => p.id === id)
}

export async function getAllPartners(): Promise<Partner[]> {
  const state = await loadState()
  return state.partners
}

export async function blockPartner(id: string, blocked: boolean): Promise<void> {
  const state = await loadState()
  const index = state.partners.findIndex((p) => p.id === id)
  if (index !== -1) {
    state.partners[index].blocked = blocked
    await saveState(state)
  }
}

// Document operations
export async function addDocument(
  doc: Omit<PartnerDocument, "id" | "uploadedAt" | "status">
): Promise<void> {
  const state = await loadState()
  const partnerIndex = state.partners.findIndex((p) => p.id === doc.partnerId)
  if (partnerIndex !== -1) {
    const newDoc: PartnerDocument = {
      ...doc,
      id: genId("doc"),
      uploadedAt: new Date().toISOString(),
      status: "pending",
    }
    state.partners[partnerIndex].documents.push(newDoc)
    state.partners[partnerIndex].documentsStatus = "pending"
    await saveState(state)
  }
}

export async function reviewDocument(
  docId: string,
  partnerId: string,
  status: "approved" | "rejected",
  note?: string,
  reviewerId?: string
): Promise<void> {
  const state = await loadState()
  const partnerIndex = state.partners.findIndex((p) => p.id === partnerId)
  if (partnerIndex !== -1) {
    const docIndex = state.partners[partnerIndex].documents.findIndex((d) => d.id === docId)
    if (docIndex !== -1) {
      state.partners[partnerIndex].documents[docIndex].status = status
      state.partners[partnerIndex].documents[docIndex].reviewNote = note
      state.partners[partnerIndex].documents[docIndex].reviewedBy = reviewerId
      
      const allApproved = state.partners[partnerIndex].documents.length > 0 &&
        state.partners[partnerIndex].documents.every((d) => d.status === "approved")
      const anyRejected = state.partners[partnerIndex].documents.some((d) => d.status === "rejected")
      
      state.partners[partnerIndex].documentsStatus = allApproved ? "approved" : anyRejected ? "rejected" : "pending"
      await saveState(state)
    }
  }
}

// Plan operations
export async function addPlan(data: Omit<Plan, "id">): Promise<Plan> {
  const state = await loadState()
  const plan: Plan = { ...data, id: genId("plan") }
  state.plans.push(plan)
  await saveState(state)
  return plan
}

export async function updatePlan(id: string, data: Partial<Plan>): Promise<void> {
  const state = await loadState()
  const index = state.plans.findIndex((p) => p.id === id)
  if (index !== -1) {
    state.plans[index] = { ...state.plans[index], ...data }
    await saveState(state)
  }
}

export async function deletePlan(id: string): Promise<void> {
  const state = await loadState()
  state.plans = state.plans.filter((p) => p.id !== id)
  await saveState(state)
}

export async function getAllPlans(): Promise<Plan[]> {
  const state = await loadState()
  return state.plans
}

// Subscription operations
export async function addSubscription(
  data: Omit<PlanSubscription, "id" | "createdAt" | "status">
): Promise<PlanSubscription> {
  const state = await loadState()
  const sub: PlanSubscription = {
    ...data,
    id: genId("sub"),
    createdAt: new Date().toISOString(),
    status: "pending",
  }
  state.subscriptions.push(sub)
  await saveState(state)
  return sub
}

export async function reviewSubscription(
  id: string,
  status: "approved" | "rejected",
  note?: string,
  reviewerId?: string
): Promise<void> {
  const state = await loadState()
  const index = state.subscriptions.findIndex((s) => s.id === id)
  if (index !== -1) {
    state.subscriptions[index].status = status
    state.subscriptions[index].reviewNote = note
    state.subscriptions[index].reviewedBy = reviewerId
    
    if (status === "approved") {
      const plan = state.plans.find((p) => p.id === state.subscriptions[index].planId)
      if (plan) {
        const start = new Date()
        const expires = new Date()
        expires.setDate(expires.getDate() + plan.durationDays)
        state.subscriptions[index].startDate = start.toISOString()
        state.subscriptions[index].expiresAt = expires.toISOString()
        
        const partnerIndex = state.partners.findIndex((p) => p.id === state.subscriptions[index].partnerId)
        if (partnerIndex !== -1) {
          state.partners[partnerIndex].licenseType = "paid"
          state.partners[partnerIndex].licenseExpiry = expires.toISOString()
          state.partners[partnerIndex].planId = plan.id
          state.partners[partnerIndex].blocked = false
        }
      }
    }
    await saveState(state)
  }
}

export async function getAllSubscriptions(): Promise<PlanSubscription[]> {
  const state = await loadState()
  return state.subscriptions
}

// Payment Method operations
export async function addPaymentMethod(data: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
  const state = await loadState()
  const pm: PaymentMethod = { ...data, id: genId("pm") }
  state.paymentMethods.push(pm)
  await saveState(state)
  return pm
}

export async function updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<void> {
  const state = await loadState()
  const index = state.paymentMethods.findIndex((pm) => pm.id === id)
  if (index !== -1) {
    state.paymentMethods[index] = { ...state.paymentMethods[index], ...data }
    await saveState(state)
  }
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const state = await loadState()
  state.paymentMethods = state.paymentMethods.filter((pm) => pm.id !== id)
  await saveState(state)
}

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  const state = await loadState()
  return state.paymentMethods
}

// Service operations
export async function addService(data: Omit<ServiceProduct, "id" | "createdAt">): Promise<ServiceProduct> {
  const state = await loadState()
  const service: ServiceProduct = {
    ...data,
    id: genId("svc"),
    createdAt: new Date().toISOString(),
  }
  state.services.push(service)
  await saveState(state)
  return service
}

export async function updateService(id: string, data: Partial<ServiceProduct>): Promise<void> {
  const state = await loadState()
  const index = state.services.findIndex((s) => s.id === id)
  if (index !== -1) {
    state.services[index] = { ...state.services[index], ...data }
    await saveState(state)
  }
}

export async function deleteService(id: string): Promise<void> {
  const state = await loadState()
  state.services = state.services.filter((s) => s.id !== id)
  await saveState(state)
}

export async function getServicesByPartner(partnerId: string): Promise<ServiceProduct[]> {
  const state = await loadState()
  return state.services.filter((s) => s.partnerId === partnerId)
}

// Activity Log operations
export async function addLog(data: Omit<ActivityLog, "id" | "timestamp">): Promise<void> {
  const state = await loadState()
  state.logs.unshift({
    ...data,
    id: genId("log"),
    timestamp: new Date().toISOString(),
  })
  await saveState(state)
}

export async function getLogs(limit: number = 100): Promise<ActivityLog[]> {
  const state = await loadState()
  return state.logs.slice(0, limit)
}

// Admin operations
export async function getAdminByEmail(email: string): Promise<Admin | undefined> {
  const state = await loadState()
  return state.admins.find((a) => a.email === email)
}

export async function getAllAdmins(): Promise<Admin[]> {
  const state = await loadState()
  return state.admins
}
