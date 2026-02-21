"use client"

import { useState } from "react"
import { useStore } from "@/lib/data/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface PMForm {
  name: string
  details: string
  active: boolean
}

const emptyForm: PMForm = { name: "", details: "", active: true }

export default function AdminPaymentMethodsPage() {
  const store = useStore()
  const [showDialog, setShowDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<PMForm>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setShowDialog(true)
  }

  const openEdit = (id: string) => {
    const pm = store.state.paymentMethods.find((p) => p.id === id)
    if (!pm) return
    setEditId(id)
    setForm({ name: pm.name, details: pm.details, active: pm.active })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Nome obrigatorio"); return }
    if (!form.details.trim()) { toast.error("Detalhes obrigatorios"); return }

    if (editId) {
      store.updatePaymentMethod(editId, form)
      store.addLog({ userId: "admin-1", userType: "admin", action: "Metodo de pagamento actualizado", details: form.name })
      toast.success("Metodo de pagamento actualizado")
    } else {
      store.addPaymentMethod(form)
      store.addLog({ userId: "admin-1", userType: "admin", action: "Metodo de pagamento criado", details: form.name })
      toast.success("Metodo de pagamento criado")
    }
    setShowDialog(false)
  }

  const handleDelete = (id: string) => {
    const pm = store.state.paymentMethods.find((p) => p.id === id)
    store.deletePaymentMethod(id)
    store.addLog({ userId: "admin-1", userType: "admin", action: "Metodo de pagamento eliminado", details: pm?.name || id })
    toast.success("Metodo de pagamento eliminado")
    setDeleteConfirm(null)
  }

  const usedInPlans = (pmId: string) => {
    return store.state.plans.filter((p) => p.paymentMethodIds.includes(pmId)).length
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metodos de Pagamento</h1>
          <p className="text-muted-foreground">{store.state.paymentMethods.length} metodo(s) configurado(s)</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Metodo
        </Button>
      </div>

      {store.state.paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum metodo de pagamento configurado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {store.state.paymentMethods.map((pm) => {
            const planCount = usedInPlans(pm.id)
            return (
              <Card key={pm.id} className={!pm.active ? "opacity-60" : ""}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{pm.name}</p>
                      <p className="text-sm text-muted-foreground">{pm.details}</p>
                      {planCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Usado em {planCount} plano(s)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={pm.active ? "default" : "secondary"}>
                      {pm.active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(pm.id)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirm(pm.id)}
                    >
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
            <DialogTitle>{editId ? "Editar Metodo" : "Novo Metodo de Pagamento"}</DialogTitle>
            <DialogDescription>
              {editId ? "Actualize os dados do metodo de pagamento" : "Preencha os dados do novo metodo"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Multicaixa Express" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Detalhes</Label>
              <Textarea
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                placeholder="Ex: Numero: 923 456 789"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))} />
              <Label>Activo</Label>
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
            <DialogTitle>Eliminar Metodo de Pagamento</DialogTitle>
            <DialogDescription>
              Tem a certeza? Este metodo sera removido de todos os planos associados.
            </DialogDescription>
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
