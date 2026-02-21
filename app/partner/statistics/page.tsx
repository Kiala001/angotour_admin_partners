"use client"

import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#2E7D32", "#66BB6A", "#A5D6A7", "#C8E6C9", "#E8F5E9"]

export default function PartnerStatisticsPage() {
  const { user } = useAuth()
  const { state } = useStore()

  const partner = state.partners.find((p) => p.id === user?.id)
  if (!partner) return null

  const services = state.services.filter((s) => s.partnerId === partner.id)
  const categoryData = services.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  const activeCount = services.filter((s) => s.active).length
  const inactiveCount = services.filter((s) => !s.active).length
  const pieData = [
    { name: "Activos", value: activeCount },
    { name: "Inactivos", value: inactiveCount },
  ].filter((d) => d.value > 0)

  const docs = partner.documents
  const docsData = [
    { name: "Aprovados", value: docs.filter((d) => d.status === "approved").length },
    { name: "Pendentes", value: docs.filter((d) => d.status === "pending").length },
    { name: "Rejeitados", value: docs.filter((d) => d.status === "rejected").length },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estatisticas</h1>
        <p className="text-muted-foreground">Visao geral do seu negocio</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{services.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{Object.keys(categoryData).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Itens por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Estado dos Itens</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                    {pieData.map((_, index) => (
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
          <CardTitle className="text-foreground">Estado dos Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          {docsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={docsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#66BB6A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Sem documentos</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
