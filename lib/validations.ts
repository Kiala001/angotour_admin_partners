import { z } from "zod"

const noSpecialChars = /^[a-zA-Z0-9\sÀ-ÿ.,'-]+$/
const notOnlyNumbers = /[a-zA-ZÀ-ÿ]/

export const partnerRegistrationSchema = z.object({
  companyName: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .regex(noSpecialChars, "Nome nao pode conter caracteres especiais")
    .regex(notOnlyNumbers, "Nome nao pode ser apenas numeros"),
  nif: z
    .string()
    .length(14, "NIF deve ter exactamente 14 digitos")
    .regex(/^\d{14}$/, "NIF deve conter apenas numeros"),
  phone: z
    .string()
    .regex(
      /^(\+244)?9\d{8}$/,
      "Telefone deve ter formato 9XXXXXXXX ou +2449XXXXXXXX"
    ),
  email: z.string().email("Email invalido"),
  province: z
    .string()
    .min(2, "Provincia obrigatoria")
    .regex(noSpecialChars, "Provincia nao pode conter caracteres especiais")
    .regex(notOnlyNumbers, "Provincia nao pode ser apenas numeros"),
  city: z
    .string()
    .min(2, "Cidade obrigatoria")
    .regex(noSpecialChars, "Cidade nao pode conter caracteres especiais")
    .regex(notOnlyNumbers, "Cidade nao pode ser apenas numeros"),
  bairro: z
    .string()
    .min(2, "Bairro obrigatorio")
    .regex(noSpecialChars, "Bairro nao pode conter caracteres especiais")
    .regex(notOnlyNumbers, "Bairro nao pode ser apenas numeros"),
  rua: z.string().min(2, "Rua obrigatoria"),
  loginEmail: z.string().email("Email de login invalido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/\d/, "Senha deve conter pelo menos 1 numero")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Senha deve conter pelo menos 1 caractere especial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas nao coincidem",
  path: ["confirmPassword"],
})

export type PartnerRegistrationForm = z.infer<typeof partnerRegistrationSchema>

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome obrigatorio"),
  description: z.string().min(5, "Descricao obrigatoria"),
  price: z.number().min(0, "Preco deve ser positivo"),
  category: z.string().min(1, "Categoria obrigatoria"),
  type: z.enum(["service", "product"]),
  stockControl: z.boolean().optional(),
  stock: z.number().min(0).optional(),
})

export type ServiceForm = z.infer<typeof serviceSchema>

export const planSchema = z.object({
  name: z.string().min(2, "Nome obrigatorio"),
  durationDays: z.number().min(1, "Duracao deve ser pelo menos 1 dia"),
  price: z.number().min(0, "Preco deve ser positivo"),
  paymentMethodIds: z.array(z.string()).min(1, "Selecione pelo menos 1 metodo de pagamento"),
  active: z.boolean(),
})

export type PlanForm = z.infer<typeof planSchema>

export const paymentMethodSchema = z.object({
  name: z.string().min(2, "Nome obrigatorio"),
  details: z.string().min(5, "Detalhes obrigatorios"),
  active: z.boolean(),
})

export type PaymentMethodForm = z.infer<typeof paymentMethodSchema>

export function formatAOA(value: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " Kz"
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
