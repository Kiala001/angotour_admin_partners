"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { daysUntil } from "@/lib/validations"
import { AlertTriangle, Ban } from "lucide-react"

export function PlanExpiryBanner() {
  const { user } = useAuth()
  const { state } = useStore()

  if (!user || user.role !== "partner") return null
  const partner = state.partners.find((p) => p.id === user.id)
  if (!partner) return null

  if (partner.blocked) {
    return (
      <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm">
        <Ban className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-destructive font-medium">
          A sua conta esta bloqueada. Entre em contacto com o suporte ou{" "}
          <Link href="/partner/plans" className="underline font-bold">adquira um plano</Link>.
        </span>
      </div>
    )
  }

  const days = daysUntil(partner.licenseExpiry)

  if (days <= 0) {
    return (
      <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm">
        <Ban className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-destructive font-medium">
          A sua licenca expirou.{" "}
          <Link href="/partner/plans" className="underline font-bold">Renove o seu plano</Link>.
        </span>
      </div>
    )
  }

  if (days <= 10) {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800 font-medium">
          A sua licenca expira em {days} dia{days !== 1 ? "s" : ""}.{" "}
          <Link href="/partner/plans" className="underline font-bold text-amber-900">Renove agora</Link>.
        </span>
      </div>
    )
  }

  return null
}
