"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { formatAOA, daysUntil } from "@/lib/validations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Crown, Check, Upload, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import type { Partner, Plan, PlanSubscription, PaymentMethod } from "@/lib/types"

export default function PartnerPlansPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [subscriptions, setSubscriptions] = useState<PlanSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [receiptName, setReceiptName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authLoading) {
      console.log("[v0] Plans page: Auth still loading...")
      return
    }

    if (!user?.id) {
      console.log("[v0] Plans page: No user ID available:", user)
      setLoading(false)
      return
    }

    console.log("[v0] Plans page: Starting data fetch for user:", user.id)
    fetchData()
  }, [user?.id, authLoading])

  const fetchData = async () => {
    if (!user?.id) {
      console.log("[v0] Plans: No user ID, skipping fetch")
      return
    }

    try {
      setError(null)
      console.log("[v0] Fetching plans data for:", user.id)

      const [partnerRes, plansRes, pmsRes, subsRes] = await Promise.all([
        fetch(`/api/partners/${user.id}`),
        fetch("/api/plans"),
        fetch("/api/payment-methods"),
        fetch("/api/subscriptions"),
      ])

      if (partnerRes.ok) {
        const data = await partnerRes.json()
        setPartner(data)
        console.log("[v0] Partner loaded:", data)
      } else {
        const errText = await partnerRes.text()
        console.error("[v0] Partner fetch error (status", partnerRes.status, "):", errText)
        setError("Erro ao carregar dados do parceiro")
      }

      if (plansRes.ok) {
        const data = await plansRes.json()
        const activePlans = Array.isArray(data) ? data.filter((p: Plan) => p.active !== false) : []
        setPlans(activePlans)
        console.log("[v0] Plans loaded:", activePlans)
      } else {
        console.error("[v0] Plans fetch error:", await plansRes.text())
        setPlans([])
      }

      if (pmsRes.ok) {
        const data = await pmsRes.json()
        const activeMs = Array.isArray(data) ? data.filter((pm: PaymentMethod) => pm.active !== false) : []
        setPaymentMethods(activeMs)
        console.log("[v0] Payment methods loaded:", activeMs)
      } else {
        console.error("[v0] Payment methods fetch error:", await pmsRes.text())
        setPaymentMethods([])
      }

      if (subsRes.ok) {
        const data = await subsRes.json()
        const filtered = Array.isArray(data) ? data.filter((s: PlanSubscription) => s.partnerId === user.id) : []
        setSubscriptions(filtered)
        console.log("[v0] Subscriptions loaded:", filtered)
      } else {
        console.error("[v0] Subscriptions fetch error:", await subsRes.text())
        setSubscriptions([])
      }
    } catch (err) {
      console.error("[v0] Plans page fetch error:", err)
      setError("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setReceiptName("")
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setReceiptName(file.name)
  }

  const handleSubmitReceipt = async () => {
    if (!selectedPlan || !receiptName || !partner) {
      toast.error("Selecione o comprovativo de pagamento")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: partner.id,
          planId: selectedPlan,
          receiptFileName: receiptName,
        }),
      })

      if (res.ok) {
        await fetchData()
        toast.success("Comprovativo enviado! Aguarde aprovacao do administrador.")
        setDialogOpen(false)
        console.log("[v0] Subscription created successfully")
      } else {
        const error = await res.json()
        toast.error(error.error || "Erro ao criar subscricao")
      }
    } catch (err) {
      console.error("[v0] Error submitting receipt:", err)
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos</h1>
          <p className="text-muted-foreground">Carregando autenticacao...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos</h1>
          <p className="text-muted-foreground">Erro ao carregar dados</p>
        </div>
      </div>
    )
  }

  const activeSub = subscriptions
    .filter((s) => s.status === "approved")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  const currentPlan = activeSub ? plans.find((p) => p.id === activeSub.planId) : null
  const daysLeft = daysUntil(partner.licenseExpiry)
  const plan = selectedPlan ? plans.find((p) => p.id === selectedPlan) : null
  const planPaymentMethods = plan
    ? paymentMethods.filter((pm) => plan.paymentMethodIds.includes(pm.id))
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
              {currentPlan ? "Pago" : "Teste Gratis"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Nenhum plano disponivel</p>
            </CardContent>
          </Card>
        ) : (
          plans.map((p) => (
            <Card key={p.id} className={activeSub?.planId === p.id ? "border-primary border-2" : ""}>
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
                  variant={activeSub?.planId === p.id ? "secondary" : "default"}
                  onClick={() => handleSelectPlan(p.id)}
                  disabled={submitting}
                >
                  {activeSub?.planId === p.id ? "Renovar" : "Escolher Plano"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Historico de Subscricoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {subscriptions.map((sub) => {
                const subPlan = plans.find((p) => p.id === sub.planId)
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
                disabled={submitting}
              />
              <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()} disabled={submitting}>
                <Upload className="mr-2 h-4 w-4" />
                {receiptName || "Selecionar ficheiro"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={handleSubmitReceipt} disabled={!receiptName || submitting}>
              <Check className="mr-2 h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar Comprovativo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
