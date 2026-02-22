"use client"

import { useRef, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { REQUIRED_DOCUMENT } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, CheckCircle2, XCircle, Clock, FileText, AlertTriangle, Info, Eye, ShieldCheck } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]

export default function DocumentsPage() {
  const { user } = useAuth()
  const store = useStore()
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const partner = store.state.partners.find((p) => p.id === user?.id)

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground text-center">A carregar dados do parceiro...</p>
      </div>
    )
  }

  const alvara = partner.documents.find((d) => d.type === REQUIRED_DOCUMENT)
  const hasAlvara = !!alvara
  const isApproved = alvara?.status === "approved"
  const isRejected = alvara?.status === "rejected"
  const isPending = alvara?.status === "pending"
  const canUpload = !hasAlvara || isRejected

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    handleUpload(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleUpload = useCallback(async (file: File) => {
    if (!partner) return
    setUploading(true)
    try {
      // Upload via API
      const formData = new FormData()
      formData.append("file", file)
      formData.append("partnerId", partner.id)
      formData.append("docType", REQUIRED_DOCUMENT)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao enviar ficheiro")
        return
      }

      // Also read as base64 for immediate preview
      const reader = new FileReader()
      reader.onload = () => {
        const fileData = reader.result as string
        store.addDocument({
          partnerId: partner.id,
          type: REQUIRED_DOCUMENT,
          fileName: data.fileName,
          fileData,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
        })

        store.addLog({
          userId: partner.id,
          userType: "partner",
          action: alvara ? "Alvara reenviado" : "Alvara enviado",
          details: `Ficheiro: ${data.fileName} (${formatFileSize(data.fileSize)})`,
        })

        toast.success("Alvara enviado com sucesso! Aguarde a aprovacao.")
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error("Erro ao processar o ficheiro. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }, [partner, store, alvara])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documento - Alvara</h1>
        <p className="text-muted-foreground">
          Submeta o Alvara comercial do seu estabelecimento para verificacao
        </p>
      </div>

      {/* Welcome guide for new partners */}
      {!hasAlvara && (
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-foreground">Bem-vindo ao Angotour!</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Para activar o seu estabelecimento na plataforma, precisa enviar o seu <strong>Alvara Comercial</strong>.
            Este documento sera analisado pela nossa equipa. Formatos aceites: PDF, JPG ou PNG (maximo 5MB).
          </AlertDescription>
        </Alert>
      )}

      {isRejected && alvara?.reviewNote && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alvara rejeitado</AlertTitle>
          <AlertDescription>
            <strong>Motivo:</strong> {alvara.reviewNote}
            <br />
            Por favor corrija e reenvie o documento.
          </AlertDescription>
        </Alert>
      )}

      {isApproved && (
        <Alert className="border-primary/30 bg-primary/5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertTitle className="text-foreground">Alvara aprovado!</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            O seu estabelecimento esta verificado. Pode agora adicionar os seus servicos e produtos,
            e subscrever um plano para manter a sua presenca na plataforma.
          </AlertDescription>
        </Alert>
      )}

      {/* Main document card */}
      <Card className={
        isApproved ? "border-primary/40" :
        isRejected ? "border-destructive/40" :
        isPending ? "border-amber-300" :
        "border-dashed border-muted-foreground/30"
      }>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isApproved ? "bg-primary/10" :
                isRejected ? "bg-destructive/10" :
                isPending ? "bg-amber-100" :
                "bg-muted"
              }`}>
                {isApproved ? <CheckCircle2 className="h-6 w-6 text-primary" /> :
                 isRejected ? <XCircle className="h-6 w-6 text-destructive" /> :
                 isPending ? <Clock className="h-6 w-6 text-amber-600" /> :
                 <FileText className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div>
                <CardTitle className="text-foreground">Alvara Comercial</CardTitle>
                <CardDescription>
                  {isApproved ? "Documento verificado e aprovado" :
                   isRejected ? "Documento rejeitado - reenvie corrigido" :
                   isPending ? "Documento em analise pela equipa" :
                   "Documento obrigatorio para activacao"}
                </CardDescription>
              </div>
            </div>
            <Badge variant={
              isApproved ? "default" :
              isRejected ? "destructive" :
              isPending ? "secondary" :
              "outline"
            }>
              {isApproved ? "Aprovado" :
               isRejected ? "Rejeitado" :
               isPending ? "Em Analise" :
               "Nao Enviado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Show existing file info */}
          {alvara && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alvara.fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {alvara.fileSize && <span>{formatFileSize(alvara.fileSize)}</span>}
                    <span>Enviado em {new Date(alvara.uploadedAt).toLocaleDateString("pt-AO")}</span>
                  </div>
                </div>
              </div>
              {(alvara.fileData || alvara.fileUrl) && (
                <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Ver
                </Button>
              )}
            </div>
          )}

          {/* Upload section */}
          {canUpload && (
            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isRejected ? "Reenviar Alvara corrigido" : "Enviar Alvara Comercial"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG ou PNG | Maximo 5MB
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <Button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                size="lg"
                variant={isRejected ? "destructive" : "default"}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Enviando..." : isRejected ? "Reenviar Documento" : "Selecionar Ficheiro"}
              </Button>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-900">
                O seu Alvara foi enviado com sucesso e esta a ser analisado pela equipa Angotour.
                Sera notificado assim que a revisao estiver concluida.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info card about the process */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">1</div>
              <p className="text-sm text-muted-foreground">Envie o Alvara Comercial do seu estabelecimento</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">2</div>
              <p className="text-sm text-muted-foreground">A equipa Angotour analisa e aprova o documento</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">3</div>
              <p className="text-sm text-muted-foreground">Apos aprovacao, adicione os seus servicos e produtos</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">4</div>
              <p className="text-sm text-muted-foreground">Subscreva um plano para manter a visibilidade na plataforma</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Alvara Comercial</DialogTitle>
            <DialogDescription>{alvara?.fileName}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-4 min-h-[300px]">
            {alvara?.fileData ? (
              alvara.fileData.startsWith("data:application/pdf") ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="h-16 w-16 text-primary" />
                  <p className="text-sm text-muted-foreground">Documento PDF</p>
                  <a href={alvara.fileData} download={alvara.fileName} className="text-sm text-primary underline">
                    Descarregar PDF
                  </a>
                </div>
              ) : (
                <img
                  src={alvara.fileData}
                  alt="Alvara Comercial"
                  className="max-h-[500px] max-w-full rounded object-contain"
                  crossOrigin="anonymous"
                />
              )
            ) : alvara?.fileUrl ? (
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-16 w-16 text-primary" />
                <a href={alvara.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                  Abrir ficheiro
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem pre-visualizacao disponivel</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
