"use client"

import { useState } from "react"
import { useStore } from "@/lib/data/store"
import { formatAOA } from "@/lib/validations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Search, Package, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import type { ServiceProduct } from "@/lib/types"

export default function AdminServicesPage() {
  const store = useStore()
  const [search, setSearch] = useState("")
  const [partnerFilter, setPartnerFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editDialog, setEditDialog] = useState<ServiceProduct | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, category: "geral",
    type: "service" as "service" | "product", stockControl: false, stock: 0, active: true,
  })

  const allServices = store.state.services.map((s) => {
    const partner = store.state.partners.find((p) => p.id === s.partnerId)
    return { ...s, partnerName: partner?.companyName || "Desconhecido" }
  })

  const filtered = allServices
    .filter((s) => {
      if (search) {
        const q = search.toLowerCase()
        return s.name.toLowerCase().includes(q) || s.partnerName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      }
      return true
    })
    .filter((s) => partnerFilter === "all" || s.partnerId === partnerFilter)
    .filter((s) => typeFilter === "all" || s.type === typeFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const openEdit = (svc: ServiceProduct) => {
    setEditDialog(svc)
    setFormData({
      name: svc.name, description: svc.description, price: svc.price,
      category: svc.category, type: svc.type, stockControl: svc.stockControl || false,
      stock: svc.stock || 0, active: svc.active,
    })
  }

  const handleSave = () => {
    if (!editDialog) return
    store.updateService(editDialog.id, {
      name: formData.name, description: formData.description, price: formData.price,
      category: formData.category, type: formData.type, stockControl: formData.stockControl,
      stock: formData.stockControl ? formData.stock : undefined, active: formData.active,
    })
    store.addLog({ userId: "admin-1", userType: "admin", action: "Servico editado (admin)", details: `${formData.name}` })
    toast.success("Servico/Produto actualizado")
    setEditDialog(null)
  }

  const handleDelete = (id: string) => {
    const svc = store.state.services.find((s) => s.id === id)
    store.deleteService(id)
    store.addLog({ userId: "admin-1", userType: "admin", action: "Servico removido (admin)", details: svc?.name || id })
    toast.success("Servico/Produto removido")
    setDeleteConfirm(null)
  }

  const handleToggle = (svc: ServiceProduct) => {
    store.updateService(svc.id, { active: !svc.active })
    toast.success(svc.active ? "Desactivado" : "Activado")
  }

  const partnersWithServices = [...new Map(allServices.map((s) => [s.partnerId, s.partnerName])).entries()]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestao de Servicos e Produtos</h1>
        <p className="text-muted-foreground">{store.state.services.length} item(ns) registado(s) por todos os parceiros</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, parceiro ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="Parceiro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Parceiros</SelectItem>
            {partnersWithServices.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="service">Servicos</SelectItem>
            <SelectItem value="product">Produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum servico/produto encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((svc) => (
            <Card key={svc.id} className={!svc.active ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{svc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{svc.partnerName}</span>
                      <span>|</span>
                      <span>{svc.category}</span>
                      <span>|</span>
                      <span>{formatAOA(svc.price)}</span>
                      {svc.stockControl && <><span>|</span><span>Stock: {svc.stock}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={svc.type === "service" ? "default" : "secondary"}>
                    {svc.type === "service" ? "Servico" : "Produto"}
                  </Badge>
                  <Switch checked={svc.active} onCheckedChange={() => handleToggle(svc)} aria-label="Activar/Desactivar" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(svc)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(svc.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editDialog} onOpenChange={(open) => { if (!open) setEditDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Servico/Produto</DialogTitle>
            <DialogDescription>Editar dados do item</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Nome</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground">Descricao</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Preco (Kz)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Categoria</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={formData.stockControl} onCheckedChange={(v) => setFormData({ ...formData, stockControl: v })} />
                <Label className="text-foreground">Controlo de Stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.active} onCheckedChange={(v) => setFormData({ ...formData, active: v })} />
                <Label className="text-foreground">Activo</Label>
              </div>
            </div>
            {formData.stockControl && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Stock</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Remover Item</DialogTitle>
            <DialogDescription>Tem a certeza que deseja remover este servico/produto? Esta accao nao pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
