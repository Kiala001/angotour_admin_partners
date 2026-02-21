"use client"

import { useStore } from "@/lib/data/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"

export default function PartnerPaymentMethodsPage() {
  const { state } = useStore()
  const activeMethods = state.paymentMethods.filter((pm) => pm.active)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Metodos de Pagamento</h1>
        <p className="text-muted-foreground">Metodos de pagamento aceites pelo Angotour</p>
      </div>

      {activeMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum metodo de pagamento disponivel</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeMethods.map((pm) => (
            <Card key={pm.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{pm.name}</CardTitle>
                <Badge variant="default">Activo</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pm.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
