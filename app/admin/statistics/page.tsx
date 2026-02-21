"use client"

import { useStore } from "@/lib/data/store"
import { PARTNER_TYPE_LABELS, type PartnerType } from "@/lib/types"
import { formatAOA, daysUntil } from "@/lib/validations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, FileText, Receipt, TrendingUp, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts"

const COLORS = ["#2E7D32", "#66BB6A", "#A5D6A7", "#C8E6C9", "#388E3C", "#1B5E20", "#81C784", "#4CAF50", "#43A047"]

export default function AdminStatisticsPage() {
  const { state } = useStore()

  const totalPartners = state.partners.length
  const activePartners = state.partners.filter((p) => !p.blocked).length
  const blockedPartners = state.partners.filter((p) => p.blocked).length
  const freeTrialPartners = state.partners.filter((p) => p.licenseType === "free_trial").length
  const paidPartners = state.partners.filter((p) => p.licenseType === "paid").length
  const expiredPartners = state.partners.filter((p) => daysUntil(p.licenseExpiry) <= 0).length

  const totalDocs = state.partners.reduce((acc, p) => acc + p.documents.length, 0)
  const pendingDocs = state.partners.reduce((acc, p) => acc + p.documents.filter((d) => d.status === "pending").length, 0)
  const approvedDocs = state.partners.reduce((acc, p) => acc + p.documents.filter((d) => d.status === "approved").length, 0)
  const rejectedDocs = state.partners.reduce((acc, p) => acc + p.documents.filter((d) => d.status === "rejected").length, 0)

  const totalSubs = state.subscriptions.length
  const approvedSubs = state.subscriptions.filter((s) => s.status === "approved").length
  const pendingSubs = state.subscriptions.filter((s) => s.status === "pending").length
  const totalRevenue = state.subscriptions
    .filter((s) => s.status === "approved")
    .reduce((acc, s) => {
      const plan = state.plans.find((p) => p.id === s.planId)
      return acc + (plan?.price || 0)
    }, 0)

  const totalServices = state.services.length
  const activeServices = state.services.filter((s) => s.active).length

  // Chart data
  const typeDistribution = Object.entries(
    state.partners.reduce((acc, p) => {
      const label = PARTNER_TYPE_LABELS[p.type]
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const docStatusData = [
    { name: "Aprovados", value: approvedDocs },
    { name: "Pendentes", value: pendingDocs },
    { name: "Rejeitados", value: rejectedDocs },
  ].filter((d) => d.value > 0)

  const subStatusData = [
    { name: "Aprovadas", value: approvedSubs },
    { name: "Pendentes", value: pendingSubs },
    { name: "Rejeitadas", value: state.subscriptions.filter((s) => s.status === "rejected").length },
  ].filter((d) => d.value > 0)

  const licenseData = [
    { name: "Teste Gratis", value: freeTrialPartners },
    { name: "Pago", value: paidPartners },
  ].filter((d) => d.value > 0)

  // Province distribution
  const provinceData = Object.entries(
    state.partners.reduce((acc, p) => {
      acc[p.province] = (acc[p.province] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estatisticas Globais</h1>
        <p className="text-muted-foreground">Visao geral do desempenho da plataforma</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="py-4">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalPartners}</p>
            <p className="text-xs text-muted-foreground">Total Parceiros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{activePartners}</p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <FileText className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
            <p className="text-xs text-muted-foreground">Documentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <Receipt className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalSubs}</p>
            <p className="text-xs text-muted-foreground">Subscricoes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <Crown className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{formatAOA(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">Receita Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <BarChart3 className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalServices}</p>
            <p className="text-xs text-muted-foreground">Servicos ({activeServices} activos)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Parceiros por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Tipo de Licenca</CardTitle>
          </CardHeader>
          <CardContent>
            {licenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={licenseData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {licenseData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Estado dos Documentos</CardTitle>
            <CardDescription>{totalDocs} documento(s) total</CardDescription>
          </CardHeader>
          <CardContent>
            {docStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={docStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill="#2E7D32" />
                    <Cell fill="#FFA726" />
                    <Cell fill="#EF5350" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Parceiros por Provincia</CardTitle>
            <CardDescription>Top 10 provincias</CardDescription>
          </CardHeader>
          <CardContent>
            {provinceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={provinceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#66BB6A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key metrics row */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Resumo Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Parceiros Bloqueados</p>
              <p className="text-xl font-bold text-foreground">{blockedPartners}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Licencas Expiradas</p>
              <p className="text-xl font-bold text-foreground">{expiredPartners}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Docs Pendentes</p>
              <p className="text-xl font-bold text-foreground">{pendingDocs}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Subscricoes Pendentes</p>
              <p className="text-xl font-bold text-foreground">{pendingSubs}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
