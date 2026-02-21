"use client"

import { useState } from "react"
import { useStore } from "@/lib/data/store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Search, Shield, Users } from "lucide-react"

export default function AdminLogsPage() {
  const { state } = useStore()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = state.logs
    .filter((log) => {
      if (search) {
        const s = search.toLowerCase()
        return log.action.toLowerCase().includes(s) || log.details.toLowerCase().includes(s)
      }
      return true
    })
    .filter((log) => typeFilter === "all" || log.userType === typeFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Agora mesmo"
    if (diffMins < 60) return `Ha ${diffMins} min`
    if (diffHours < 24) return `Ha ${diffHours}h`
    if (diffDays < 7) return `Ha ${diffDays}d`
    return date.toLocaleDateString("pt-AO")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs de Actividade</h1>
        <p className="text-muted-foreground">{state.logs.length} registo(s) de actividade</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar accao ou detalhes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="partner">Parceiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum registo de actividade encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((log) => {
            const partner = log.userType === "partner"
              ? state.partners.find((p) => p.id === log.userId)
              : null
            const userName = log.userType === "admin"
              ? "Administrador"
              : partner?.companyName || "Parceiro"

            return (
              <Card key={log.id}>
                <CardContent className="flex items-start gap-4 py-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    {log.userType === "admin" ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <Users className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <Badge variant={log.userType === "admin" ? "default" : "secondary"} className="text-xs">
                        {log.userType === "admin" ? "Admin" : "Parceiro"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{userName}</span>
                      <span className="text-xs text-muted-foreground">-</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(log.timestamp)}</span>
                      <span className="text-xs text-muted-foreground">({new Date(log.timestamp).toLocaleString("pt-AO")})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
