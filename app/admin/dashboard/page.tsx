"use client"

import { useStore } from "@/lib/data/store"
import { PARTNER_TYPE_LABELS } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Receipt, Crown, AlertTriangle, CheckCircle2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#2E7D32", "#66BB6A", "#A5D6A7", "#C8E6C9", "#388E3C", "#1B5E20", "#81C784", "#4CAF50", "#43A047"]

export default function AdminDashboard() {
  const { state } = useStore()

  const totalPartners = state.partners.length
  const activePartners = state.partners.filter((p) => !p.blocked).length
  const blockedPartners = state.partners.filter((p) => p.blocked).length
  const pendingDocs = state.partners.reduce((acc, p) => acc + p.documents.filter((d) => d.status === "pending").length, 0)
  const pendingReceipts = state.subscriptions.filter((s) => s.status === "pending").length

  const typeData = Object.entries(
    state.partners.reduce((acc, p) => {
      acc[PARTNER_TYPE_LABELS[p.type]] = (acc[PARTNER_TYPE_LABELS[p.type]] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const statusData = [
    { name: "Activos", value: activePartners },
    { name: "Bloqueados", value: blockedPartners },
  ].filter((d) => d.value > 0)

  const recentPartners = [...state.partners]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visao geral do sistema Angotour</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Parceiros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalPartners}</div>
            <p className="text-xs text-muted-foreground">{activePartners} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Docs Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingDocs}</div>
            <p className="text-xs text-muted-foreground">A aguardar aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recibos Pendentes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingReceipts}</div>
            <p className="text-xs text-muted-foreground">Comprovativos por aprovar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Planos Activos</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{state.plans.filter((p) => p.active).length}</div>
            <p className="text-xs text-muted-foreground">{state.plans.length} total</p>
          </CardContent>
        </Card>
      </div>

      {(pendingDocs > 0 || pendingReceipts > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">Acções Pendentes</p>
              <p className="text-xs text-amber-700">
                {pendingDocs > 0 && `${pendingDocs} documento(s) pendente(s)`}
                {pendingDocs > 0 && pendingReceipts > 0 && " | "}
                {pendingReceipts > 0 && `${pendingReceipts} comprovativo(s) pendente(s)`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Parceiros por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem parceiros registados</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Estado dos Parceiros</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Registos Recentes</CardTitle>
          <CardDescription>Ultimos parceiros registados</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPartners.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum parceiro registado</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentPartners.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {p.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.companyName}</p>
                      <p className="text-xs text-muted-foreground">{PARTNER_TYPE_LABELS[p.type]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.documentsStatus === "approved" ? "default" : "secondary"}>
                      {p.documentsStatus === "approved" ? "Docs OK" : p.documentsStatus === "pending" ? "Docs Pendentes" : "Sem Docs"}
                    </Badge>
                    {p.blocked && <Badge variant="destructive">Bloqueado</Badge>}
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
