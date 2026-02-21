"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { PARTNER_TYPE_LABELS, PROVINCES } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Clock } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const store = useStore()

  const partner = store.state.partners.find((p) => p.id === user?.id)
  if (!partner) return null

  const [form, setForm] = useState({
    companyName: partner.companyName,
    phone: partner.phone,
    email: partner.email,
    province: partner.province,
    city: partner.city,
    bairro: partner.bairro,
    rua: partner.rua,
  })

  const handleSave = () => {
    store.updatePartner(partner.id, form)
    store.addLog({
      userId: partner.id,
      userType: "partner",
      action: "Perfil actualizado",
      details: "Informacoes do perfil actualizadas",
    })
    toast.success("Perfil actualizado com sucesso")
  }

  const logs = store.state.logs
    .filter((l) => l.userId === partner.id)
    .slice(0, 20)

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
              <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">NIF</Label>
              <Input value={partner.nif} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Provincia</Label>
              <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })}>
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
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Bairro</Label>
              <Input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Rua</Label>
              <Input value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Alteracoes
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
                {partner.blocked ? "Bloqueado" : partner.licenseType === "free_trial" ? "Teste Gratis" : "Pago"}
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
