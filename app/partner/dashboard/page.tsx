"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { daysUntil, formatAOA } from "@/lib/validations"
import { PARTNER_TYPE_LABELS, type Partner, type ServiceProduct, type PlanSubscription, type Plan, type PartnerDocument } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Package, Crown, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export default function PartnerDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [services, setServices] = useState<ServiceProduct[]>([])
  const [subscriptions, setSubscriptions] = useState<PlanSubscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) {
      console.log("[v0] Auth still loading...")
      return
    }

    if (!user?.id) {
      console.log("[v0] No user ID available:", user)
      setLoading(false)
      return
    }

    console.log("[v0] Dashboard: Starting data fetch for user:", user.id)
    fetchData()
  }, [user?.id, authLoading])

  const fetchData = async () => {
    if (!user?.id) {
      console.log("[v0] No user ID, skipping fetch")
      return
    }

    try {
      setError(null)
      console.log("[v0] Fetching partner data for:", user.id)

      const partnerRes = await fetch(`/api/partners/${user.id}`)
      if (partnerRes.ok) {
        const data = await partnerRes.json()
        console.log("[v0] Partner data loaded:", data)
        setPartner(data)
      } else {
        const errText = await partnerRes.text()
        console.error("[v0] Partner fetch error (status", partnerRes.status, "):", errText)
        setError("Erro ao carregar dados do parceiro")
      }

      const servicesRes = await fetch(`/api/services?partnerId=${user.id}`)
      if (servicesRes.ok) {
        const data = await servicesRes.json()
        console.log("[v0] Services loaded:", data)
        setServices(Array.isArray(data) ? data : [])
      } else {
        console.error("[v0] Services fetch error:", await servicesRes.text())
        setServices([])
      }

      const subsRes = await fetch("/api/subscriptions")
      if (subsRes.ok) {
        const data = await subsRes.json()
        console.log("[v0] Subscriptions loaded:", data)
        const filtered = Array.isArray(data) ? data.filter((s: PlanSubscription) => s.partnerId === user.id) : []
        setSubscriptions(filtered)
      } else {
        console.error("[v0] Subscriptions fetch error:", await subsRes.text())
        setSubscriptions([])
      }

      const plansRes = await fetch("/api/plans")
      if (plansRes.ok) {
        const data = await plansRes.json()
        console.log("[v0] Plans loaded:", data)
        setPlans(Array.isArray(data) ? data : [])
      } else {
        console.error("[v0] Plans fetch error:", await plansRes.text())
        setPlans([])
      }
    } catch (err) {
      console.error("[v0] Dashboard fetch error:", err)
      setError("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carregando autenticacao...</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carregando...</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carregando dados...</h1>
        </div>
      </div>
    )
  }

  const activeSub = subscriptions
    .filter((s) => s.partnerId === partner.id && s.status === "approved")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  const currentPlan = activeSub ? plans.find((p) => p.id === activeSub.planId) : null
  const daysLeft = daysUntil(partner.licenseExpiry)

  const docsTotal = partner.documents.length
  const docsApproved = partner.documents.filter((d) => d.status === "approved").length
  const docsPending = partner.documents.filter((d) => d.status === "pending").length
  const docsRejected = partner.documents.filter((d) => d.status === "rejected").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Bem-vindo, {partner.companyName}
        </h1>
        <p className="text-muted-foreground">
          {PARTNER_TYPE_LABELS[partner.type]}
          {partner.type === "Mista" && partner.mistaSubTypes
            ? ` (${partner.mistaSubTypes.map((t) => PARTNER_TYPE_LABELS[t]).join(", ")})`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{docsApproved}/{docsTotal}</div>
            <p className="text-xs text-muted-foreground">
              {docsPending > 0 && `${docsPending} pendente(s)`}
              {docsRejected > 0 && ` ${docsRejected} rejeitado(s)`}
              {docsPending === 0 && docsRejected === 0 && docsTotal > 0 && "Todos aprovados"}
              {docsTotal === 0 && "Nenhum enviado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Servicos/Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              {services.filter((s) => s.active).length} activo(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plano Actual</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {currentPlan ? currentPlan.name : "Teste Gratis"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPlan ? formatAOA(currentPlan.price) : "30 dias"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Licenca</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {daysLeft > 0 ? `${daysLeft} dias` : "Expirada"}
            </div>
            <Badge variant={daysLeft > 10 ? "default" : daysLeft > 0 ? "secondary" : "destructive"} className="mt-1">
              {daysLeft > 10 ? "Activa" : daysLeft > 0 ? "Expirando" : "Expirada"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Estado dos Documentos</CardTitle>
          <CardDescription>Veja o estado de cada documento submetido</CardDescription>
        </CardHeader>
        <CardContent>
          {partner.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum documento submetido ainda. Acesse a pagina de Documentos para enviar.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {partner.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.type}</p>
                      <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === "approved" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    {doc.status === "rejected" && <XCircle className="h-4 w-4 text-destructive" />}
                    {doc.status === "pending" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    <Badge variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}>
                      {doc.status === "approved" ? "Aprovado" : doc.status === "rejected" ? "Rejeitado" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
