"use client"

import { useState } from "react"
import { useStore } from "@/lib/data/store"
import { PARTNER_TYPE_LABELS } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { FileText, CheckCircle2, XCircle, Search, AlertTriangle, Eye } from "lucide-react"
import { toast } from "sonner"

interface DocRow {
  partnerId: string
  partnerName: string
  partnerType: string
  docId: string
  docType: string
  fileName: string
  fileData?: string
  fileUrl?: string
  uploadedAt: string
  status: string
  reviewNote?: string
}

export default function AdminDocumentsPage() {
  const store = useStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [reviewDialog, setReviewDialog] = useState<DocRow | null>(null)
  const [reviewNote, setReviewNote] = useState("")

  const allDocs: DocRow[] = store.state.partners.flatMap((p) =>
    p.documents.map((d) => ({
      partnerId: p.id,
      partnerName: p.companyName,
      partnerType: PARTNER_TYPE_LABELS[p.type],
      docId: d.id,
      docType: d.type,
      fileName: d.fileName,
      fileData: d.fileData,
      fileUrl: d.fileUrl,
      uploadedAt: d.uploadedAt,
      status: d.status,
      reviewNote: d.reviewNote,
    }))
  )

  const filtered = allDocs
    .filter((d) => {
      if (search) {
        const s = search.toLowerCase()
        return d.partnerName.toLowerCase().includes(s) || d.docType.toLowerCase().includes(s)
      }
      return true
    })
    .filter((d) => statusFilter === "all" || d.status === statusFilter)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  const pendingCount = allDocs.filter((d) => d.status === "pending").length

  const handleReview = (status: "approved" | "rejected") => {
    if (!reviewDialog) return
    store.reviewDocument(reviewDialog.docId, reviewDialog.partnerId, status, reviewNote || undefined, "admin-1")
    store.addLog({
      userId: "admin-1",
      userType: "admin",
      action: status === "approved" ? "Alvara aprovado" : "Alvara rejeitado",
      details: `${reviewDialog.partnerName}${reviewNote ? ` - ${reviewNote}` : ""}`,
    })
    toast.success(status === "approved" ? "Alvara aprovado com sucesso" : "Alvara rejeitado")
    setReviewDialog(null)
    setReviewNote("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aprovacao de Alvaras</h1>
        <p className="text-muted-foreground">{pendingCount} alvara(s) pendente(s) de aprovacao</p>
      </div>

      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              Existem <strong>{pendingCount}</strong> alvara(s) a aguardar a sua revisao.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por parceiro..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
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
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === "pending" ? "Nenhum alvara pendente" : "Nenhum alvara encontrado"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((doc) => (
            <Card key={`${doc.partnerId}-${doc.docId}`}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.partnerName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.partnerType}</span>
                      <span>|</span>
                      <span>Alvara: {doc.fileName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enviado em {new Date(doc.uploadedAt).toLocaleDateString("pt-AO")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}>
                    {doc.status === "approved" ? "Aprovado" : doc.status === "rejected" ? "Rejeitado" : "Pendente"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => { setReviewDialog(doc); setReviewNote("") }}>
                    {doc.status === "pending" ? "Rever" : "Ver"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => { if (!open) { setReviewDialog(null); setReviewNote("") } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Alvara - {reviewDialog?.partnerName}</DialogTitle>
            <DialogDescription>{reviewDialog?.partnerType}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{reviewDialog?.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviado em {reviewDialog && new Date(reviewDialog.uploadedAt).toLocaleString("pt-AO")}
                  </p>
                </div>
              </div>
              {/* File preview */}
              {(reviewDialog?.fileData || reviewDialog?.fileUrl) && (
                <div className="mt-3 flex items-center justify-center rounded border border-border bg-card p-2 min-h-[150px]">
                  {reviewDialog.fileData?.startsWith("data:application/pdf") ? (
                    <a href={reviewDialog.fileData} download={reviewDialog.fileName} className="flex items-center gap-2 text-sm text-primary underline">
                      <Eye className="h-4 w-4" /> Descarregar PDF
                    </a>
                  ) : reviewDialog.fileData ? (
                    <img src={reviewDialog.fileData} alt="Alvara" className="max-h-[250px] max-w-full rounded object-contain" crossOrigin="anonymous" />
                  ) : reviewDialog.fileUrl ? (
                    <a href={reviewDialog.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary underline">
                      <Eye className="h-4 w-4" /> Abrir ficheiro
                    </a>
                  ) : null}
                </div>
              )}
            </div>

            {reviewDialog?.status === "rejected" && reviewDialog.reviewNote && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <strong>Nota anterior:</strong> {reviewDialog.reviewNote}
              </div>
            )}

            {reviewDialog?.status === "pending" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Nota (opcional)</label>
                <Textarea placeholder="Adicione uma nota sobre a revisao..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} />
              </div>
            )}
          </div>
          {reviewDialog?.status === "pending" && (
            <DialogFooter className="flex gap-2">
              <Button variant="destructive" onClick={() => handleReview("rejected")} className="flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Rejeitar
              </Button>
              <Button onClick={() => handleReview("approved")} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Aprovar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
