"use client"

import { useState } from "react"
import { useStore } from "@/lib/data/store"
import { formatAOA } from "@/lib/validations"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Receipt, CheckCircle2, XCircle, Search, AlertTriangle, FileImage } from "lucide-react"
import { toast } from "sonner"

export default function AdminSubscriptionsPage() {
  const store = useStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [reviewDialog, setReviewDialog] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState("")

  const pendingCount = store.state.subscriptions.filter((s) => s.status === "pending").length

  const enriched = store.state.subscriptions.map((sub) => {
    const partner = store.state.partners.find((p) => p.id === sub.partnerId)
    const plan = store.state.plans.find((p) => p.id === sub.planId)
    return { ...sub, partnerName: partner?.companyName || "Desconhecido", planName: plan?.name || "Plano removido", planPrice: plan?.price || 0 }
  })

  const filtered = enriched
    .filter((s) => {
      if (search) {
        const q = search.toLowerCase()
        return s.partnerName.toLowerCase().includes(q) || s.planName.toLowerCase().includes(q)
      }
      return true
    })
    .filter((s) => statusFilter === "all" || s.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleReview = (status: "approved" | "rejected") => {
    if (!reviewDialog) return
    const sub = enriched.find((s) => s.id === reviewDialog)
    if (!sub) return
    store.reviewSubscription(reviewDialog, status, reviewNote || undefined, "admin-1")
    store.addLog({
      userId: "admin-1",
      userType: "admin",
      action: status === "approved" ? "Subscricao aprovada" : "Subscricao rejeitada",
      details: `${sub.planName} - ${sub.partnerName}${reviewNote ? ` | ${reviewNote}` : ""}`,
    })
    toast.success(status === "approved" ? "Subscricao aprovada - plano activado" : "Subscricao rejeitada")
    setReviewDialog(null)
    setReviewNote("")
  }

  const currentSub = reviewDialog ? enriched.find((s) => s.id === reviewDialog) : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aprovacao de Subscricoes</h1>
        <p className="text-muted-foreground">{pendingCount} comprovativo(s) pendente(s)</p>
      </div>

      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              <strong>{pendingCount}</strong> comprovativo(s) de pagamento a aguardar aprovacao.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por parceiro ou plano..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === "pending" ? "Nenhum comprovativo pendente" : "Nenhuma subscricao encontrada"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sub.partnerName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{sub.planName}</span>
                      <span>|</span>
                      <span>{formatAOA(sub.planPrice)}</span>
                      <span>|</span>
                      <span>{sub.receiptFileName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submetido em {new Date(sub.createdAt).toLocaleDateString("pt-AO")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={sub.status === "approved" ? "default" : sub.status === "rejected" ? "destructive" : "secondary"}
                  >
                    {sub.status === "approved" ? "Aprovado" : sub.status === "rejected" ? "Rejeitado" : "Pendente"}
                  </Badge>
                  {sub.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => setReviewDialog(sub.id)}>
                      Rever
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!reviewDialog} onOpenChange={(open) => { if (!open) { setReviewDialog(null); setReviewNote("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rever Comprovativo</DialogTitle>
            <DialogDescription>
              Subscricao de {currentSub?.partnerName} ao plano {currentSub?.planName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <FileImage className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{currentSub?.receiptFileName}</p>
                  <p className="text-sm text-muted-foreground">Plano: {currentSub?.planName} - {currentSub ? formatAOA(currentSub.planPrice) : ""}</p>
                  <p className="text-xs text-muted-foreground">
                    Submetido em {currentSub && new Date(currentSub.createdAt).toLocaleString("pt-AO")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Nota (opcional)</label>
              <Textarea
                placeholder="Adicione uma nota..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ao aprovar, o plano sera activado automaticamente e a licenca do parceiro sera actualizada.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="destructive" onClick={() => handleReview("rejected")} className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejeitar
            </Button>
            <Button onClick={() => handleReview("approved")} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
