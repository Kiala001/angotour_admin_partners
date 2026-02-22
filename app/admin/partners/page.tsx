"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PARTNER_TYPE_LABELS, type PartnerType, type Partner } from "@/lib/types"
import { daysUntil } from "@/lib/validations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Eye, Ban, CheckCircle2, Users } from "lucide-react"
import { toast } from "sonner"

const ALL_TYPES: PartnerType[] = ["Hotel", "Restaurante", "Bar", "Geladaria", "Resort", "Cafeteria", "RentACar", "GuiaTuristico", "Mista"]

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners")
      if (res.ok) {
        const data = await res.json()
        setPartners(data)
      }
    } catch (err) {
      console.error("[v0] Error fetching partners:", err)
      toast.error("Erro ao carregar parceiros")
    } finally {
      setLoading(false)
    }
  }

  const filtered = partners
    .filter((p) => {
      if (search) {
        const s = search.toLowerCase()
        return p.companyName.toLowerCase().includes(s) || p.nif.includes(s) || p.email.toLowerCase().includes(s)
      }
      return true
    })
    .filter((p) => typeFilter === "all" || p.type === typeFilter)
    .filter((p) => {
      if (statusFilter === "active") return !p.blocked
      if (statusFilter === "blocked") return p.blocked
      if (statusFilter === "pending_docs") return p.documentsStatus === "pending"
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleToggleBlock = async (id: string, blocked: boolean) => {
    try {
      const res = await fetch(`/api/partners/${id}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !blocked }),
      })

      if (res.ok) {
        await fetchPartners()
        toast.success(blocked ? "Parceiro desbloqueado" : "Parceiro bloqueado")
      }
    } catch (err) {
      console.error("[v0] Error toggling block:", err)
      toast.error("Erro ao atualizar parceiro")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestao de Parceiros</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestao de Parceiros</h1>
        <p className="text-muted-foreground">{partners.length} parceiro(s) registado(s)</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, NIF ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {ALL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{PARTNER_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
            <SelectItem value="pending_docs">Docs Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => {
            const days = daysUntil(p.licenseExpiry)
            return (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {p.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{p.companyName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{PARTNER_TYPE_LABELS[p.type]}</span>
                        <span>|</span>
                        <span>NIF: {p.nif}</span>
                        <span>|</span>
                        <span>{p.province}, {p.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.documentsStatus === "approved" ? "default" : p.documentsStatus === "pending" ? "secondary" : "outline"}>
                      {p.documentsStatus === "approved" ? "Docs OK" : p.documentsStatus === "pending" ? "Docs Pend." : p.documentsStatus === "rejected" ? "Docs Rej." : "Sem Docs"}
                    </Badge>
                    <Badge variant={days > 0 ? "default" : "destructive"}>
                      {days > 0 ? `${days}d` : "Expirado"}
                    </Badge>
                    {p.blocked && <Badge variant="destructive">Bloqueado</Badge>}
                    <Link href={`/admin/partners/${p.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${p.blocked ? "text-primary" : "text-destructive"}`}
                      onClick={() => handleToggleBlock(p.id, p.blocked)}
                    >
                      {p.blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </Button>
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
