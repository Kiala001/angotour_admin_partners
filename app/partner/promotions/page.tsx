"use client"

import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { formatAOA } from "@/lib/validations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

export default function PromotionsPage() {
  const { user } = useAuth()
  const { state } = useStore()

  const partner = state.partners.find((p) => p.id === user?.id)
  if (!partner) return null

  const services = state.services.filter((s) => s.partnerId === partner.id && s.active)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Promocoes</h1>
        <p className="text-muted-foreground">Gerencie as promocoes dos seus servicos e produtos</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">Funcionalidade em desenvolvimento</p>
          <p className="text-sm text-muted-foreground mt-1">Em breve podera criar promocoes para os seus itens</p>
        </CardContent>
      </Card>

      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Itens Activos (disponiveis para promocao)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {services.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.category}</p>
                  </div>
                  <Badge variant="secondary">{formatAOA(s.price)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
