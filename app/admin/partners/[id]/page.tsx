"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/data/store"
import { PARTNER_TYPE_LABELS, PROVINCES, type PartnerType } from "@/lib/types"
import { daysUntil, formatAOA } from "@/lib/validations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Ban, CheckCircle2, FileText, Clock, Pencil, Trash2, Package } from "lucide-react"
import { toast } from "sonner"

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const store = useStore()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState({
    companyName: "", nif: "", phone: "", email: "",
    province: "", city: "", bairro: "", rua: "",
  })

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
  const currentPlan = partner.planId ? store.state.plans.find((p) => p.id === partner.planId) : null

  const handleToggleBlock = () => {
    store.blockPartner(partner.id, !partner.blocked)
    store.addLog({ userId: "admin-1", userType: "admin", action: partner.blocked ? "Parceiro desbloqueado" : "Parceiro bloqueado", details: partner.companyName })
    toast.success(partner.blocked ? "Desbloqueado" : "Bloqueado")
  }

  const openEdit = () => {
    setForm({
      companyName: partner.companyName, nif: partner.nif, phone: partner.phone,
      email: partner.email, province: partner.province, city: partner.city,
      bairro: partner.bairro, rua: partner.rua,
    })
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!form.companyName.trim()) { toast.error("Nome obrigatorio"); return }
    store.updatePartner(partner.id, {
      companyName: form.companyName, nif: form.nif, phone: form.phone,
      email: form.email, province: form.province, city: form.city,
      bairro: form.bairro, rua: form.rua,
    })
    store.addLog({ userId: "admin-1", userType: "admin", action: "Parceiro editado", details: form.companyName })
    toast.success("Dados do parceiro actualizados")
    setEditOpen(false)
  }

  const handleDelete = () => {
    store.deletePartner(partner.id)
    store.addLog({ userId: "admin-1", userType: "admin", action: "Parceiro eliminado", details: partner.companyName })
    toast.success("Parceiro eliminado")
    router.push("/admin/partners")
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
          </Button>
          <Button variant={partner.blocked ? "default" : "destructive"} size="sm" onClick={handleToggleBlock}>
            {partner.blocked ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <Ban className="mr-1.5 h-3.5 w-3.5" />}
            {partner.blocked ? "Desbloquear" : "Bloquear"}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-foreground">Informacoes</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-foreground">Estado</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Alvara:</span>
                <Badge variant={partner.documentsStatus === "approved" ? "default" : partner.documentsStatus === "rejected" ? "destructive" : "secondary"}>
                  {partner.documentsStatus === "approved" ? "Aprovado" : partner.documentsStatus === "pending" ? "Pendente" : partner.documentsStatus === "rejected" ? "Rejeitado" : "Nao enviado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Licenca:</span>
                <Badge variant={days > 0 ? "default" : "destructive"}>{days > 0 ? `${days} dias` : "Expirada"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plano:</span>
                <Badge variant="secondary">{currentPlan ? `${currentPlan.name} (${formatAOA(currentPlan.price)})` : "Teste Gratis"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bloqueado:</span>
                <Badge variant={partner.blocked ? "destructive" : "default"}>{partner.blocked ? "Sim" : "Nao"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Servicos/Produtos:</span>
                <span className="text-sm text-foreground font-medium">{services.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alvara */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Alvara</CardTitle>
          <CardDescription>{partner.documents.length > 0 ? "Documento submetido" : "Nenhum documento enviado"}</CardDescription>
        </CardHeader>
        <CardContent>
          {partner.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Parceiro ainda nao enviou o Alvara</p>
          ) : (
            <div className="flex flex-col gap-2">
              {partner.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.type}</p>
                      <p className="text-xs text-muted-foreground">{doc.fileName} | {new Date(doc.uploadedAt).toLocaleDateString("pt-AO")}</p>
                    </div>
                  </div>
                  <Badge variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}>
                    {doc.status === "approved" ? "Aprovado" : doc.status === "rejected" ? "Rejeitado" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Servicos e Produtos</CardTitle>
          <CardDescription>{services.length} item(ns)</CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem servicos ou produtos</p>
          ) : (
            <div className="flex flex-col gap-2">
              {services.slice(0, 10).map((svc) => (
                <div key={svc.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{svc.name}</p>
                      <p className="text-xs text-muted-foreground">{svc.category} | {formatAOA(svc.price)}</p>
                    </div>
                  </div>
                  <Badge variant={svc.active ? "default" : "secondary"}>{svc.active ? "Activo" : "Inactivo"}</Badge>
                </div>
              ))}
              {services.length > 10 && <p className="text-xs text-muted-foreground text-center">... e mais {services.length - 10} item(ns)</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriptions */}
      <Card>
        <CardHeader><CardTitle className="text-foreground">Subscricoes</CardTitle></CardHeader>
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
                      <p className="text-sm font-medium text-foreground">{plan?.name || "Plano removido"} {plan ? `- ${formatAOA(plan.price)}` : ""}</p>
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

      {/* Activity */}
      <Card>
        <CardHeader><CardTitle className="text-foreground">Actividade Recente</CardTitle></CardHeader>
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

      {/* Edit partner dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Parceiro</DialogTitle>
            <DialogDescription>Actualize os dados do parceiro</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Nome da Empresa</Label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">NIF</Label>
                <Input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} />
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
                    {PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Eliminar Parceiro</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja eliminar <strong>{partner.companyName}</strong>? 
              Todos os servicos, documentos e subscricoes serao removidos. Esta accao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar Permanentemente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
