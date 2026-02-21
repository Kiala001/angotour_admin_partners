"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { formatAOA, daysUntil } from "@/lib/validations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Crown, Check, Upload, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function PartnerPlansPage() {
  const { user } = useAuth()
  const store = useStore()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [receiptName, setReceiptName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const partner = store.state.partners.find((p) => p.id === user?.id)
  if (!partner) return null

  const activePlans = store.state.plans.filter((p) => p.active)
  const mySubscriptions = store.state.subscriptions
    .filter((s) => s.partnerId === partner.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const daysLeft = daysUntil(partner.licenseExpiry)
  const currentPlan = partner.planId ? store.state.plans.find((p) => p.id === partner.planId) : null

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setReceiptName("")
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setReceiptName(file.name)
  }

  const handleSubmitReceipt = () => {
    if (!selectedPlan || !receiptName) {
      toast.error("Selecione o comprovativo de pagamento")
      return
    }
    store.addSubscription({
      partnerId: partner.id,
      planId: selectedPlan,
      receiptFileName: receiptName,
    })
    store.addLog({
      userId: partner.id,
      userType: "partner",
      action: "Subscricao enviada",
      details: `Comprovativo enviado para plano ${store.state.plans.find((p) => p.id === selectedPlan)?.name}`,
    })
    toast.success("Comprovativo enviado! Aguarde aprovacao do administrador.")
    setDialogOpen(false)
  }

  const plan = selectedPlan ? store.state.plans.find((p) => p.id === selectedPlan) : null
  const planPaymentMethods = plan
    ? store.state.paymentMethods.filter((pm) => plan.paymentMethodIds.includes(pm.id) && pm.active)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Planos</h1>
        <p className="text-muted-foreground">Escolha o plano ideal para o seu negocio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Plano Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{currentPlan ? currentPlan.name : "Teste Gratis"}</p>
                <p className="text-sm text-muted-foreground">
                  {daysLeft > 0 ? `${daysLeft} dias restantes` : "Expirado"}
                </p>
              </div>
            </div>
            <Badge variant={daysLeft > 10 ? "default" : daysLeft > 0 ? "secondary" : "destructive"}>
              {partner.licenseType === "free_trial" ? "Teste Gratis" : "Pago"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {activePlans.map((p) => (
          <Card key={p.id} className={partner.planId === p.id ? "border-primary border-2" : ""}>
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">{p.name}</CardTitle>
              <CardDescription>{p.durationDays} dias</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-foreground">{formatAOA(p.price)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                ~{formatAOA(Math.round(p.price / p.durationDays))}/dia
              </p>
              <Button
                className="mt-4 w-full"
                variant={partner.planId === p.id ? "secondary" : "default"}
                onClick={() => handleSelectPlan(p.id)}
              >
                {partner.planId === p.id ? "Renovar" : "Escolher Plano"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {mySubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Historico de Subscricoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {mySubscriptions.map((sub) => {
                const subPlan = store.state.plans.find((p) => p.id === sub.planId)
                return (
                  <div key={sub.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      {sub.status === "approved" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      {sub.status === "rejected" && <XCircle className="h-4 w-4 text-destructive" />}
                      {sub.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
                      <div>
                        <p className="text-sm font-medium text-foreground">{subPlan?.name || "Plano removido"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString("pt-AO")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={sub.status === "approved" ? "default" : sub.status === "rejected" ? "destructive" : "secondary"}>
                      {sub.status === "approved" ? "Aprovado" : sub.status === "rejected" ? "Rejeitado" : "Pendente"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Subscrever Plano: {plan?.name}</DialogTitle>
            <DialogDescription>
              Faca o pagamento usando um dos metodos abaixo e envie o comprovativo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {plan && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-foreground">Valor a pagar: {formatAOA(plan.price)}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Metodos de Pagamento:</p>
              <div className="flex flex-col gap-2">
                {planPaymentMethods.map((pm) => (
                  <div key={pm.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">{pm.name}</p>
                    <p className="text-xs text-muted-foreground">{pm.details}</p>
                  </div>
                ))}
                {planPaymentMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum metodo de pagamento disponivel</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Comprovativo de Pagamento:</p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {receiptName || "Selecionar ficheiro"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitReceipt} disabled={!receiptName}>
              <Check className="mr-2 h-4 w-4" />
              Enviar Comprovativo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
