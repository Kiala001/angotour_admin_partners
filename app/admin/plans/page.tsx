"use client"

import { useState } from "react"
import { useStore } from "@/lib/data/store"
import { formatAOA } from "@/lib/validations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Crown, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface PlanFormState {
  name: string
  durationDays: number
  price: number
  paymentMethodIds: string[]
  active: boolean
}

const emptyForm: PlanFormState = {
  name: "",
  durationDays: 30,
  price: 0,
  paymentMethodIds: [],
  active: true,
}

export default function AdminPlansPage() {
  const store = useStore()
  const [showDialog, setShowDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanFormState>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setShowDialog(true)
  }

  const openEdit = (id: string) => {
    const plan = store.state.plans.find((p) => p.id === id)
    if (!plan) return
    setEditId(id)
    setForm({
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price,
      paymentMethodIds: plan.paymentMethodIds,
      active: plan.active,
    })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Nome obrigatorio"); return }
    if (form.durationDays < 1) { toast.error("Duracao deve ser pelo menos 1 dia"); return }
    if (form.price < 0) { toast.error("Preco invalido"); return }
    if (form.paymentMethodIds.length === 0) { toast.error("Selecione pelo menos 1 metodo de pagamento"); return }

    if (editId) {
      store.updatePlan(editId, { ...form, currency: "AOA" })
      store.addLog({ userId: "admin-1", userType: "admin", action: "Plano actualizado", details: form.name })
      toast.success("Plano actualizado")
    } else {
      store.addPlan({ ...form, currency: "AOA" })
      store.addLog({ userId: "admin-1", userType: "admin", action: "Plano criado", details: form.name })
      toast.success("Plano criado")
    }
    setShowDialog(false)
  }

  const handleDelete = (id: string) => {
    const plan = store.state.plans.find((p) => p.id === id)
    store.deletePlan(id)
    store.addLog({ userId: "admin-1", userType: "admin", action: "Plano eliminado", details: plan?.name || id })
    toast.success("Plano eliminado")
    setDeleteConfirm(null)
  }

  const togglePM = (pmId: string) => {
    setForm((f) => ({
      ...f,
      paymentMethodIds: f.paymentMethodIds.includes(pmId)
        ? f.paymentMethodIds.filter((id) => id !== pmId)
        : [...f.paymentMethodIds, pmId],
    }))
  }

  const activePMs = store.state.paymentMethods.filter((pm) => pm.active)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestao de Planos</h1>
          <p className="text-muted-foreground">{store.state.plans.length} plano(s) configurado(s)</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {store.state.plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Crown className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum plano criado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {store.state.plans.map((plan) => {
            const linkedPMs = store.state.paymentMethods.filter((pm) => plan.paymentMethodIds.includes(pm.id))
            return (
              <Card key={plan.id} className={!plan.active ? "opacity-60" : ""}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-foreground">{plan.name}</CardTitle>
                    <p className="text-2xl font-bold text-primary mt-1">{formatAOA(plan.price)}</p>
                  </div>
                  <Badge variant={plan.active ? "default" : "secondary"}>
                    {plan.active ? "Activo" : "Inactivo"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">{plan.durationDays} dias</p>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Metodos de pagamento:</p>
                    <div className="flex flex-wrap gap-1">
                      {linkedPMs.map((pm) => (
                        <Badge key={pm.id} variant="outline" className="text-xs">{pm.name}</Badge>
                      ))}
                      {linkedPMs.length === 0 && (
                        <span className="text-xs text-muted-foreground">Nenhum</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => openEdit(plan.id)} className="flex-1 flex items-center gap-1">
                      <Pencil className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(plan.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Plano" : "Novo Plano"}</DialogTitle>
            <DialogDescription>
              {editId ? "Actualize os dados do plano" : "Preencha os dados do novo plano"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Mensal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Duracao (dias)</Label>
                <Input type="number" value={form.durationDays} onChange={(e) => setForm((f) => ({ ...f, durationDays: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Preco (Kz)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Metodos de Pagamento</Label>
              {activePMs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum metodo de pagamento activo</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {activePMs.map((pm) => (
                    <label key={pm.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={form.paymentMethodIds.includes(pm.id)}
                        onCheckedChange={() => togglePM(pm.id)}
                      />
                      <span className="text-sm text-foreground">{pm.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))} />
              <Label>Plano activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editId ? "Guardar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Plano</DialogTitle>
            <DialogDescription>Tem a certeza que deseja eliminar este plano? Esta accao nao pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
