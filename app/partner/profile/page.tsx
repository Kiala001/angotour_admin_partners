"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { PARTNER_TYPE_LABELS, PROVINCES } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Save, Clock } from "lucide-react"
import { toast } from "sonner"
import type { Partner, ActivityLog } from "@/lib/types"

interface ProfileForm {
  companyName: string
  phone: string
  email: string
  province: string
  city: string
  bairro: string
  rua: string
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    companyName: "",
    phone: "",
    email: "",
    province: "",
    city: "",
    bairro: "",
    rua: "",
  })

  useEffect(() => {
    if (authLoading) {
      console.log("[v0] Profile page: Auth still loading...")
      return
    }

    if (!user?.id) {
      console.log("[v0] Profile page: No user ID available:", user)
      setLoading(false)
      return
    }

    console.log("[v0] Profile page: Starting data fetch for user:", user.id)
    fetchData()
  }, [user?.id, authLoading])

  const fetchData = async () => {
    if (!user?.id) {
      console.log("[v0] Profile: No user ID, skipping fetch")
      return
    }

    try {
      setError(null)
      console.log("[v0] Fetching profile data for:", user.id)

      const partnerRes = await fetch(`/api/partners/${user.id}`)
      if (partnerRes.ok) {
        const data = await partnerRes.json()
        setPartner(data)
        setForm({
          companyName: data.companyName,
          phone: data.phone,
          email: data.email,
          province: data.province,
          city: data.city,
          bairro: data.bairro,
          rua: data.rua,
        })
        console.log("[v0] Partner loaded:", data)
      } else {
        const errText = await partnerRes.text()
        console.error("[v0] Partner fetch error (status", partnerRes.status, "):", errText)
        setError("Erro ao carregar dados do parceiro")
      }

      const logsRes = await fetch(`/api/logs?userId=${user.id}`)
      if (logsRes.ok) {
        const data = await logsRes.json()
        setLogs(Array.isArray(data) ? data.slice(0, 20) : [])
        console.log("[v0] Logs loaded:", data)
      } else {
        console.error("[v0] Logs fetch error:", await logsRes.text())
        setLogs([])
      }
    } catch (err) {
      console.error("[v0] Error fetching data:", err)
      setError("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!partner) return

    if (form.companyName.trim().length < 3) {
      toast.error("Nome da empresa deve ter pelo menos 3 caracteres")
      return
    }

    if (form.phone.trim().length < 5) {
      toast.error("Telefone invalido")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        await fetchData()
        toast.success("Perfil actualizado com sucesso")
        console.log("[v0] Profile updated successfully")
      } else {
        const error = await res.json()
        toast.error(error.error || "Erro ao guardar")
      }
    } catch (err) {
      console.error("[v0] Error saving profile:", err)
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground">Erro ao carregar dados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-muted-foreground">Gerencie as informacoes do seu estabelecimento</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Informacoes Gerais</CardTitle>
          <CardDescription>
            Tipo: {PARTNER_TYPE_LABELS[partner.type]}
            {partner.type === "Mista" && partner.mistaSubTypes
              ? ` (${partner.mistaSubTypes.map((t) => PARTNER_TYPE_LABELS[t]).join(", ")})`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Nome da Empresa</Label>
              <Input 
                value={form.companyName} 
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">NIF</Label>
              <Input value={partner.nif} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Telefone</Label>
              <Input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Email</Label>
              <Input 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Provincia</Label>
              <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })} disabled={saving}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Cidade</Label>
              <Input 
                value={form.city} 
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Bairro</Label>
              <Input 
                value={form.bairro} 
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Rua</Label>
              <Input 
                value={form.rua} 
                onChange={(e) => setForm({ ...form, rua: e.target.value })}
                disabled={saving}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Guardando..." : "Guardar Alteracoes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Estado da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Documentos</p>
              <Badge variant={partner.documentsStatus === "approved" ? "default" : partner.documentsStatus === "rejected" ? "destructive" : "secondary"} className="mt-1">
                {partner.documentsStatus === "approved" ? "Aprovados" : partner.documentsStatus === "rejected" ? "Rejeitados" : partner.documentsStatus === "pending" ? "Pendentes" : "Nao enviados"}
              </Badge>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Licenca</p>
              <Badge variant={partner.blocked ? "destructive" : "default"} className="mt-1">
                {partner.blocked ? "Bloqueado" : "Activo"}
              </Badge>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Login</p>
              <p className="text-sm font-medium text-foreground mt-1">{partner.loginEmail}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Actividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma actividade registada</p>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString("pt-AO")}</p>
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
