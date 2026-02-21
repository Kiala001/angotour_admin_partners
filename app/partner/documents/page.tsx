"use client"

import { useRef, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { getRequiredDocuments } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, CheckCircle2, XCircle, Clock, FileText, AlertTriangle, Info, Eye } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]

function DocumentUploadCard({
  docType,
  existing,
  onUpload,
  onPreview,
  uploading,
}: {
  docType: string
  existing?: { id: string; fileName: string; fileData?: string; fileSize?: number; status: string; reviewNote?: string; uploadedAt: string }
  onUpload: (docType: string, file: File) => void
  onPreview: (doc: { fileName: string; fileData?: string }) => void
  uploading: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato nao suportado. Use PDF, JPG ou PNG.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ficheiro demasiado grande. Maximo 5MB.")
      return
    }

    onUpload(docType, file)
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ""
  }

  const statusIcon = existing?.status === "approved"
    ? <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
    : existing?.status === "rejected"
    ? <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
    : existing
    ? <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
    : <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />

  const statusBadge = existing?.status === "approved"
    ? <Badge variant="default">Aprovado</Badge>
    : existing?.status === "rejected"
    ? <Badge variant="destructive">Rejeitado</Badge>
    : existing
    ? <Badge variant="secondary">Pendente</Badge>
    : <Badge variant="outline">Nao enviado</Badge>

  const canUpload = !existing || existing.status === "rejected"
  const canResubmit = existing?.status === "rejected"

  return (
    <div className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
      !existing ? "border-dashed border-muted-foreground/30 bg-muted/30" :
      existing.status === "rejected" ? "border-destructive/30 bg-destructive/5" :
      existing.status === "approved" ? "border-primary/30 bg-primary/5" :
      "border-border bg-card"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {statusIcon}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{docType}</p>
            {existing ? (
              <div className="flex flex-col gap-0.5 mt-0.5">
                <p className="text-xs text-muted-foreground truncate">{existing.fileName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {existing.fileSize && <span>{formatFileSize(existing.fileSize)}</span>}
                  <span>Enviado em {new Date(existing.uploadedAt).toLocaleDateString("pt-AO")}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                Formatos aceites: PDF, JPG, PNG (max. 5MB)
              </p>
            )}
            {existing?.status === "rejected" && existing.reviewNote && (
              <div className="mt-2 flex items-start gap-1.5 rounded bg-destructive/10 p-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">
                  <span className="font-medium">Motivo da rejeicao:</span> {existing.reviewNote}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {statusBadge}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {existing?.fileData && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview({ fileName: existing.fileName, fileData: existing.fileData })}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Visualizar
          </Button>
        )}
        {canUpload && (
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
              variant={canResubmit ? "destructive" : "default"}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {uploading ? "Enviando..." : canResubmit ? "Reenviar" : "Enviar Documento"}
            </Button>
          </>
        )}
        {existing?.status === "approved" && (
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprovado
          </p>
        )}
        {existing?.status === "pending" && (
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Aguardando revisao
          </p>
        )}
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const store = useStore()
  const [uploading, setUploading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{ fileName: string; fileData?: string } | null>(null)

  const partner = store.state.partners.find((p) => p.id === user?.id)

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground text-center">
          A carregar dados do parceiro...
        </p>
      </div>
    )
  }

  const requiredDocs = getRequiredDocuments(partner.type, partner.mistaSubTypes)

  const handleUpload = useCallback(async (docType: string, file: File) => {
    setUploading(true)
    try {
      const fileData = await fileToBase64(file)
      const fileName = file.name
      const fileSize = file.size

      // Check if document of this type already exists
      const existingDoc = partner.documents.find((d) => d.type === docType)
      if (existingDoc) {
        store.updateDocument(partner.id, docType, fileName, fileData, fileSize)
      } else {
        store.addDocument({
          partnerId: partner.id,
          type: docType,
          fileName,
          fileData,
          fileSize,
        })
      }

      store.addLog({
        userId: partner.id,
        userType: "partner",
        action: existingDoc ? "Documento reenviado" : "Documento enviado",
        details: `Documento "${docType}" enviado: ${fileName} (${formatFileSize(fileSize)})`,
      })

      toast.success(`Documento "${docType}" enviado com sucesso!`)
    } catch {
      toast.error("Erro ao processar o ficheiro. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }, [partner, store])

  const uploadedCount = partner.documents.length
  const approvedCount = partner.documents.filter((d) => d.status === "approved").length
  const pendingCount = partner.documents.filter((d) => d.status === "pending").length
  const rejectedCount = partner.documents.filter((d) => d.status === "rejected").length
  const totalRequired = requiredDocs.length
  const allUploaded = uploadedCount >= totalRequired
  const allApproved = approvedCount >= totalRequired && totalRequired > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
        <p className="text-muted-foreground">
          Envie os documentos necessarios para a aprovacao do seu estabelecimento
        </p>
      </div>

      {/* Guidance alert for new partners */}
      {uploadedCount === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Bem-vindo ao Angotour!</AlertTitle>
          <AlertDescription>
            Para activar o seu estabelecimento na plataforma, precisa enviar os documentos listados abaixo.
            Cada documento sera analisado pela nossa equipa. Pode enviar ficheiros em formato PDF, JPG ou PNG (maximo 5MB cada).
          </AlertDescription>
        </Alert>
      )}

      {rejectedCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{rejectedCount} documento(s) rejeitado(s)</AlertTitle>
          <AlertDescription>
            Alguns documentos foram rejeitados. Verifique o motivo e reenvie os documentos corrigidos.
          </AlertDescription>
        </Alert>
      )}

      {allApproved && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Todos os documentos aprovados!</AlertTitle>
          <AlertDescription>
            O seu estabelecimento esta verificado. Pode agora adicionar os seus servicos e produtos.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Progresso da Documentacao</CardTitle>
          <CardDescription>
            {approvedCount} de {totalRequired} aprovado(s) | {uploadedCount} enviado(s) | {pendingCount} pendente(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${totalRequired > 0 ? (approvedCount / totalRequired) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>Aprovados ({approvedCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Pendentes ({pendingCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span>Rejeitados ({rejectedCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span>Nao enviados ({totalRequired - uploadedCount > 0 ? totalRequired - uploadedCount : 0})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document list */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Documentos Obrigatorios ({totalRequired})
        </h3>
        {requiredDocs.map((docType) => {
          const existing = partner.documents.find((d) => d.type === docType)
          return (
            <DocumentUploadCard
              key={docType}
              docType={docType}
              existing={existing}
              onUpload={handleUpload}
              onPreview={setPreviewDoc}
              uploading={uploading}
            />
          )
        })}
      </div>

      {allUploaded && !allApproved && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              Todos os documentos foram enviados. Aguarde a revisao pela equipa Angotour.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Documento</DialogTitle>
            <DialogDescription>{previewDoc?.fileName}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-4 min-h-[300px]">
            {previewDoc?.fileData ? (
              previewDoc.fileData.startsWith("data:application/pdf") ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="h-16 w-16 text-primary" />
                  <p className="text-sm text-muted-foreground">Pre-visualizacao de PDF</p>
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.fileName}
                    className="text-sm text-primary underline"
                  >
                    Descarregar PDF
                  </a>
                </div>
              ) : (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.fileName}
                  className="max-h-[500px] max-w-full rounded object-contain"
                  crossOrigin="anonymous"
                />
              )
            ) : (
              <p className="text-sm text-muted-foreground">Sem pre-visualizacao disponivel</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
