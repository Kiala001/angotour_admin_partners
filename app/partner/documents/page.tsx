"use client"

import { useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { getRequiredDocuments } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle2, XCircle, Clock, FileText } from "lucide-react"
import { toast } from "sonner"

function DocumentUploadCard({
  docType,
  existing,
  onUpload,
}: {
  docType: string
  existing?: { id: string; fileName: string; status: string; reviewNote?: string }
  onUpload: (docType: string, fileName: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(docType, file.name)
      toast.success(`Documento "${docType}" enviado com sucesso`)
    }
  }

  const statusIcon = existing?.status === "approved"
    ? <CheckCircle2 className="h-5 w-5 text-primary" />
    : existing?.status === "rejected"
    ? <XCircle className="h-5 w-5 text-destructive" />
    : existing
    ? <Clock className="h-5 w-5 text-amber-500" />
    : <FileText className="h-5 w-5 text-muted-foreground" />

  const statusBadge = existing?.status === "approved"
    ? <Badge variant="default">Aprovado</Badge>
    : existing?.status === "rejected"
    ? <Badge variant="destructive">Rejeitado</Badge>
    : existing
    ? <Badge variant="secondary">Pendente</Badge>
    : null

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        {statusIcon}
        <div>
          <p className="text-sm font-medium text-foreground">{docType}</p>
          {existing ? (
            <p className="text-xs text-muted-foreground">{existing.fileName}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Nao enviado</p>
          )}
          {existing?.status === "rejected" && existing.reviewNote && (
            <p className="mt-1 text-xs text-destructive">Motivo: {existing.reviewNote}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {statusBadge}
        {(!existing || existing.status === "rejected") && (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
            />
            <Button
              size="sm"
              variant={existing?.status === "rejected" ? "destructive" : "default"}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              {existing?.status === "rejected" ? "Reenviar" : "Enviar"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const store = useStore()

  const partner = store.state.partners.find((p) => p.id === user?.id)
  if (!partner) return null

  const requiredDocs = getRequiredDocuments(partner.type, partner.mistaSubTypes)

  const handleUpload = (docType: string, fileName: string) => {
    const existingDoc = partner.documents.find((d) => d.type === docType)
    if (existingDoc) {
      store.updatePartner(partner.id, {
        documents: partner.documents.map((d) =>
          d.type === docType ? { ...d, fileName, status: "pending" as const, uploadedAt: new Date().toISOString(), reviewNote: undefined } : d
        ),
        documentsStatus: "pending",
      })
    } else {
      store.addDocument({
        partnerId: partner.id,
        type: docType,
        fileName,
      })
    }
    store.addLog({
      userId: partner.id,
      userType: "partner",
      action: "Documento enviado",
      details: `Documento "${docType}" enviado: ${fileName}`,
    })
  }

  const uploadedCount = partner.documents.length
  const approvedCount = partner.documents.filter((d) => d.status === "approved").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
        <p className="text-muted-foreground">Envie os documentos necessarios para a aprovacao do seu estabelecimento</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Progresso</CardTitle>
          <CardDescription>
            {approvedCount} de {requiredDocs.length} documento(s) aprovado(s) | {uploadedCount} enviado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${requiredDocs.length > 0 ? (approvedCount / requiredDocs.length) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {requiredDocs.map((docType) => {
          const existing = partner.documents.find((d) => d.type === docType)
          return (
            <DocumentUploadCard
              key={docType}
              docType={docType}
              existing={existing}
              onUpload={handleUpload}
            />
          )
        })}
      </div>
    </div>
  )
}
