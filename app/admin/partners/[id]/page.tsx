"use client"

import { use } from "react"
import Link from "next/link"
import { useStore } from "@/lib/data/store"
import { PARTNER_TYPE_LABELS } from "@/lib/types"
import { daysUntil, formatAOA } from "@/lib/validations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Ban, CheckCircle2, FileText, Clock } from "lucide-react"
import { toast } from "sonner"

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const store = useStore()

  const partner = store.state.partners.find((p) => p.id === id)
  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Parceiro nao encontrado</p>
        <Link href="/admin/partners"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    )
  }

  const services = store.state.services.filter((s) => s.partnerId === partner.id)
  const subs = store.state.subscriptions.filter((s) => s.partnerId === partner.id)
  const logs = store.state.logs.filter((l) => l.userId === partner.id).slice(0, 15)
  const days = daysUntil(partner.licenseExpiry)

  const handleToggleBlock = () => {
    store.blockPartner(partner.id, !partner.blocked)
    store.addLog({
      userId: "admin-1",
      userType: "admin",
      action: partner.blocked ? "Parceiro desbloqueado" : "Parceiro bloqueado",
      details: partner.companyName,
    })
    toast.success(partner.blocked ? "Desbloqueado" : "Bloqueado")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/partners">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{partner.companyName}</h1>
          <p className="text-muted-foreground">{PARTNER_TYPE_LABELS[partner.type]}</p>
        </div>
        <Button variant={partner.blocked ? "default" : "destructive"} onClick={handleToggleBlock}>
          {partner.blocked ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
          {partner.blocked ? "Desbloquear" : "Bloquear"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Informacoes</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">NIF:</dt><dd className="text-foreground">{partner.nif}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Telefone:</dt><dd className="text-foreground">{partner.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email:</dt><dd className="text-foreground">{partner.email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Login:</dt><dd className="text-foreground">{partner.loginEmail}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Endereco:</dt><dd className="text-foreground text-right">{partner.province}, {partner.city}, {partner.bairro}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Registado em:</dt><dd className="text-foreground">{new Date(partner.createdAt).toLocaleDateString("pt-AO")}</dd></div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Documentos:</span>
                <Badge variant={partner.documentsStatus === "approved" ? "default" : partner.documentsStatus === "rejected" ? "destructive" : "secondary"}>
                  {partner.documentsStatus === "approved" ? "Aprovados" : partner.documentsStatus === "pending" ? "Pendentes" : partner.documentsStatus === "rejected" ? "Rejeitados" : "Nao enviados"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Licenca:</span>
                <Badge variant={days > 0 ? "default" : "destructive"}>{days > 0 ? `${days} dias` : "Expirada"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo Licenca:</span>
                <Badge variant="secondary">{partner.licenseType === "free_trial" ? "Teste Gratis" : "Pago"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bloqueado:</span>
                <Badge variant={partner.blocked ? "destructive" : "default"}>{partner.blocked ? "Sim" : "Nao"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Servicos:</span>
                <span className="text-sm text-foreground font-medium">{services.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Documentos</CardTitle>
          <CardDescription>{partner.documents.length} documento(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {partner.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum documento enviado</p>
          ) : (
            <div className="flex flex-col gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Subscricoes</CardTitle>
        </CardHeader>
        <CardContent>
          {subs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem subscricoes</p>
          ) : (
            <div className="flex flex-col gap-2">
              {subs.map((sub) => {
                const plan = store.state.plans.find((p) => p.id === sub.planId)
                return (
                  <div key={sub.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{plan?.name || "Plano removido"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString("pt-AO")}</p>
                    </div>
                    <Badge variant={sub.status === "approved" ? "default" : sub.status === "rejected" ? "destructive" : "secondary"}>
                      {sub.status === "approved" ? "Aprovado" : sub.status === "rejected" ? "Rejeitado" : "Pendente"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Actividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem actividade registada</p>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details} - {new Date(log.timestamp).toLocaleString("pt-AO")}</p>
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
