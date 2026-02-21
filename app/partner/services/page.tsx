"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { formatAOA } from "@/lib/validations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react"
import { toast } from "sonner"
import type { ServiceProduct } from "@/lib/types"

const CATEGORIES = [
  "quartos", "servicos", "comodidades", "pratos", "bebidas", "cardapio",
  "petiscos", "eventos", "gelados", "snacks", "veiculos", "tarifas",
  "roteiros", "pacotes", "calendario", "avaliacoes", "atividades", "geral",
]

export default function ServicesPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <ServicesPage />
    </Suspense>
  )
}

function ServicesPage() {
  const { user } = useAuth()
  const store = useStore()
  const searchParams = useSearchParams()
  const catParam = searchParams.get("cat")

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceProduct | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: catParam || "geral",
    type: "service" as "service" | "product",
    stockControl: false,
    stock: 0,
  })

  const partner = store.state.partners.find((p) => p.id === user?.id)
  if (!partner) return null

  const services = store.state.services
    .filter((s) => s.partnerId === partner.id)
    .filter((s) => !catParam || s.category === catParam)
    .filter((s) =>
      search ? s.name.toLowerCase().includes(search.toLowerCase()) : true
    )

  const openNew = () => {
    setEditing(null)
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: catParam || "geral",
      type: "service",
      stockControl: false,
      stock: 0,
    })
    setDialogOpen(true)
  }

  const openEdit = (svc: ServiceProduct) => {
    setEditing(svc)
    setFormData({
      name: svc.name,
      description: svc.description,
      price: svc.price,
      category: svc.category,
      type: svc.type,
      stockControl: svc.stockControl || false,
      stock: svc.stock || 0,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      toast.error("Preencha todos os campos obrigatorios")
      return
    }
    if (editing) {
      store.updateService(editing.id, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        type: formData.type,
        stockControl: formData.stockControl,
        stock: formData.stockControl ? formData.stock : undefined,
      })
      toast.success("Servico/Produto actualizado")
    } else {
      store.addService({
        partnerId: partner.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        type: formData.type,
        stockControl: formData.stockControl,
        stock: formData.stockControl ? formData.stock : undefined,
        images: [],
        active: true,
      })
      toast.success("Servico/Produto adicionado")
    }
    store.addLog({
      userId: partner.id,
      userType: "partner",
      action: editing ? "Servico actualizado" : "Servico adicionado",
      details: `${formData.name} (${formData.category})`,
    })
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    store.deleteService(id)
    toast.success("Servico/Produto removido")
  }

  const handleToggleActive = (svc: ServiceProduct) => {
    store.updateService(svc.id, { active: !svc.active })
    toast.success(svc.active ? "Desactivado" : "Activado")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {catParam ? catParam.charAt(0).toUpperCase() + catParam.slice(1) : "Servicos e Produtos"}
          </h1>
          <p className="text-muted-foreground">Gerencie os seus servicos e produtos</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum servico ou produto encontrado</p>
            <Button className="mt-4" onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Card key={svc.id} className={!svc.active ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium text-foreground">{svc.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{svc.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{svc.category}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatAOA(svc.price)}</p>
                    {svc.stockControl && (
                      <p className="text-xs text-muted-foreground">Stock: {svc.stock}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={svc.active}
                      onCheckedChange={() => handleToggleActive(svc)}
                      aria-label="Activar/Desactivar"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(svc)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(svc.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Editar" : "Adicionar"} Servico/Produto</DialogTitle>
            <DialogDescription>Preencha os detalhes abaixo</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
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
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as "service" | "product" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Servico</SelectItem>
                    <SelectItem value="product">Produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Controlo de Stock</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.stockControl}
                    onCheckedChange={(v) => setFormData({ ...formData, stockControl: v })}
                  />
                  <span className="text-sm text-muted-foreground">{formData.stockControl ? "Sim" : "Nao"}</span>
                </div>
              </div>
            </div>
            {formData.stockControl && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground">Quantidade em Stock</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
