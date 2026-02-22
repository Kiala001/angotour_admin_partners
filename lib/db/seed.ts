import { saveState } from "@/lib/db/repository"
import type { AppState } from "@/lib/types"

export async function initializeDatabase() {
  const initialState: AppState = {
    partners: [],
    plans: [
      {
        id: "plan-starter",
        name: "Plano Iniciante",
        durationDays: 30,
        price: 5000,
        currency: "AOA",
        paymentMethodIds: ["pm-1", "pm-2"],
        active: true,
      },
      {
        id: "plan-professional",
        name: "Plano Profissional",
        durationDays: 90,
        price: 15000,
        currency: "AOA",
        paymentMethodIds: ["pm-1", "pm-2"],
        active: true,
      },
      {
        id: "plan-premium",
        name: "Plano Premium",
        durationDays: 365,
        price: 50000,
        currency: "AOA",
        paymentMethodIds: ["pm-1", "pm-2"],
        active: true,
      },
    ],
    subscriptions: [],
    paymentMethods: [
      {
        id: "pm-1",
        name: "Transferência Bancária",
        details: "IBAN: AO06.0037.0111.111111111111.01",
        active: true,
      },
      {
        id: "pm-2",
        name: "Cartão de Crédito",
        details: "Visa, Mastercard, American Express",
        active: true,
      },
    ],
    services: [],
    admins: [
      {
        id: "admin-1",
        email: "admin@angotour.com",
        password: "admin123", // In production, use bcrypt
        name: "Administrator",
      },
    ],
    logs: [],
  }

  await saveState(initialState)
  console.log("[v0] Database initialized successfully")
}
