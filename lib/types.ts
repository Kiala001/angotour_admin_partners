export type PartnerType =
  | "Hotel"
  | "Restaurante"
  | "Bar"
  | "Geladaria"
  | "Resort"
  | "Cafeteria"
  | "RentACar"
  | "GuiaTuristico"
  | "Mista"

export type DocumentStatus = "pending" | "approved" | "rejected"
export type SubscriptionStatus = "pending" | "approved" | "rejected"

export interface PartnerDocument {
  id: string
  partnerId: string
  type: string
  fileName: string
  status: DocumentStatus
  uploadedAt: string
  reviewedBy?: string
  reviewNote?: string
}

export interface Partner {
  id: string
  type: PartnerType
  mistaSubTypes?: PartnerType[]
  companyName: string
  nif: string
  phone: string
  email: string
  loginEmail: string
  password: string
  province: string
  city: string
  bairro: string
  rua: string
  documentsStatus: "not_uploaded" | "pending" | "approved" | "rejected"
  licenseType: "free_trial" | "paid"
  licenseExpiry: string
  planId?: string
  blocked: boolean
  createdAt: string
  documents: PartnerDocument[]
  logo?: string
}

export interface Plan {
  id: string
  name: string
  durationDays: number
  price: number
  currency: string
  paymentMethodIds: string[]
  active: boolean
}

export interface PlanSubscription {
  id: string
  partnerId: string
  planId: string
  receiptFileName: string
  status: SubscriptionStatus
  startDate?: string
  expiresAt?: string
  createdAt: string
  reviewedBy?: string
  reviewNote?: string
}

export interface PaymentMethod {
  id: string
  name: string
  details: string
  active: boolean
}

export interface ServiceProduct {
  id: string
  partnerId: string
  name: string
  description: string
  price: number
  category: string
  type: "service" | "product"
  stockControl?: boolean
  stock?: number
  images: string[]
  active: boolean
  createdAt: string
}

export interface Admin {
  id: string
  email: string
  password: string
  name: string
}

export interface ActivityLog {
  id: string
  userId: string
  userType: "admin" | "partner"
  action: string
  details: string
  timestamp: string
}

export interface AppState {
  partners: Partner[]
  plans: Plan[]
  subscriptions: PlanSubscription[]
  paymentMethods: PaymentMethod[]
  services: ServiceProduct[]
  admins: Admin[]
  logs: ActivityLog[]
}

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  Hotel: "Hotel",
  Restaurante: "Restaurante",
  Bar: "Bar",
  Geladaria: "Geladaria",
  Resort: "Resort",
  Cafeteria: "Cafeteria",
  RentACar: "Rent a Car",
  GuiaTuristico: "Guia Turistico",
  Mista: "Mista",
}

export const REQUIRED_DOCUMENTS: Record<Exclude<PartnerType, "Mista">, string[]> = {
  Hotel: ["Alvará"],
  Restaurante: ["Alvará"],
  Bar: ["Alvará"],
  Geladaria: ["Alvará"],
  Resort: ["Alvará"],
  Cafeteria: ["Alvará"],
  RentACar: ["Alvará"],
  GuiaTuristico: ["Carteira Profissional"],
}

export function getRequiredDocuments(type: PartnerType, mistaSubTypes?: PartnerType[]): string[] {
  if (type === "Mista" && mistaSubTypes) {
    const docs = new Set<string>()
    for (const st of mistaSubTypes) {
      if (st !== "Mista") {
        for (const d of REQUIRED_DOCUMENTS[st]) {
          docs.add(d)
        }
      }
    }
    return Array.from(docs)
  }
  if (type !== "Mista") {
    return REQUIRED_DOCUMENTS[type]
  }
  return []
}

export const PROVINCES = [
  "Bengo", "Benguela", "Bie", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huila",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uige", "Zaire",
]

export interface PartnerMenuItem {
  label: string
  href: string
  icon: string
}

export const PARTNER_TYPE_MENUS: Record<Exclude<PartnerType, "Mista">, PartnerMenuItem[]> = {
  Hotel: [
    { label: "Quartos", href: "/partner/services?cat=quartos", icon: "bed" },
    { label: "Servicos", href: "/partner/services?cat=servicos", icon: "concierge-bell" },
    { label: "Promocoes", href: "/partner/promotions", icon: "tag" },
    { label: "Comodidades", href: "/partner/services?cat=comodidades", icon: "star" },
  ],
  Restaurante: [
    { label: "Pratos", href: "/partner/services?cat=pratos", icon: "utensils" },
    { label: "Bebidas", href: "/partner/services?cat=bebidas", icon: "cup-soda" },
    { label: "Cardapio", href: "/partner/services?cat=cardapio", icon: "book-open" },
    { label: "Promocoes", href: "/partner/promotions", icon: "tag" },
  ],
  Bar: [
    { label: "Bebidas", href: "/partner/services?cat=bebidas", icon: "wine" },
    { label: "Petiscos", href: "/partner/services?cat=petiscos", icon: "sandwich" },
    { label: "Eventos", href: "/partner/services?cat=eventos", icon: "calendar" },
    { label: "Promocoes", href: "/partner/promotions", icon: "tag" },
  ],
  Geladaria: [
    { label: "Gelados", href: "/partner/services?cat=gelados", icon: "ice-cream-cone" },
    { label: "Bebidas", href: "/partner/services?cat=bebidas", icon: "cup-soda" },
    { label: "Promocoes", href: "/partner/promotions", icon: "tag" },
  ],
  Resort: [
    { label: "Quartos", href: "/partner/services?cat=quartos", icon: "bed" },
    { label: "Servicos", href: "/partner/services?cat=servicos", icon: "concierge-bell" },
    { label: "Atividades", href: "/partner/services?cat=atividades", icon: "activity" },
    { label: "Promocoes", href: "/partner/promotions", icon: "tag" },
  ],
  Cafeteria: [
    { label: "Bebidas", href: "/partner/services?cat=bebidas", icon: "coffee" },
    { label: "Snacks", href: "/partner/services?cat=snacks", icon: "cookie" },
    { label: "Cardapio", href: "/partner/services?cat=cardapio", icon: "book-open" },
    { label: "Promocoes", href: "/partner/promotions", icon: "tag" },
  ],
  RentACar: [
    { label: "Veiculos", href: "/partner/services?cat=veiculos", icon: "car" },
    { label: "Tarifas", href: "/partner/services?cat=tarifas", icon: "receipt" },
    { label: "Promocoes", href: "/partner/promotions", icon: "tag" },
  ],
  GuiaTuristico: [
    { label: "Roteiros", href: "/partner/services?cat=roteiros", icon: "map" },
    { label: "Pacotes", href: "/partner/services?cat=pacotes", icon: "package" },
    { label: "Calendario", href: "/partner/services?cat=calendario", icon: "calendar" },
    { label: "Avaliacoes", href: "/partner/services?cat=avaliacoes", icon: "star" },
  ],
}
