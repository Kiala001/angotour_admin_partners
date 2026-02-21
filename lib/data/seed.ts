import type { Admin, Plan, PaymentMethod, AppState } from "@/lib/types"

const defaultAdmin: Admin = {
  id: "admin-1",
  email: "webtec.solution@gmail.com",
  password: "WebtecSolution",
  name: "Administrador",
}

const defaultPlans: Plan[] = [
  {
    id: "plan-1",
    name: "Mensal",
    durationDays: 30,
    price: 15000,
    currency: "AOA",
    paymentMethodIds: ["pm-1", "pm-2"],
    active: true,
  },
  {
    id: "plan-2",
    name: "Trimestral",
    durationDays: 90,
    price: 40000,
    currency: "AOA",
    paymentMethodIds: ["pm-1", "pm-2", "pm-3"],
    active: true,
  },
  {
    id: "plan-3",
    name: "Anual",
    durationDays: 365,
    price: 120000,
    currency: "AOA",
    paymentMethodIds: ["pm-1", "pm-2", "pm-3"],
    active: true,
  },
]

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: "pm-1",
    name: "Multicaixa Express",
    details: "Numero: 923 456 789",
    active: true,
  },
  {
    id: "pm-2",
    name: "Transferencia Bancaria",
    details: "BFA - IBAN: AO06 0006 0000 0000 0000 0000 1",
    active: true,
  },
  {
    id: "pm-3",
    name: "Deposito Bancario",
    details: "BAI - Conta: 00000000001 | NIB: 0040 0000 0000 0000 0001 9",
    active: true,
  },
]

export function getInitialState(): AppState {
  return {
    partners: [],
    plans: defaultPlans,
    subscriptions: [],
    paymentMethods: defaultPaymentMethods,
    services: [],
    admins: [defaultAdmin],
    logs: [],
  }
}
