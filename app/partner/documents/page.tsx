"use client"

import { useRef, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { getRequiredDocuments } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, CheckCircle2, XCircle, Clock, FileText } from "lucide-react"
import { toast } from "sonner"
import type { Partner, PartnerDocument } from "@/lib/types"

function DocumentUploadCard({
  docType,
  existing,
  onUpload,
  uploading,
}: {
  docType: string
  existing?: PartnerDocument
  onUpload: (docType: string, file: File) => Promise<void>
  uploading?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        await onUpload(docType, file)
        toast.success(`Documento "${docType}" enviado com sucesso`)
      } catch (err) {
        console.error("[v0] Upload error:", err)
        toast.error("Erro ao enviar documento")
      } finally {
        setIsUploading(false)
      }
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
              disabled={isUploading}
            />
            <Button
              size="sm"
              variant={existing?.status === "rejected" ? "destructive" : "default"}
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-1 h-3 w-3" />
              {isUploading ? "Enviando..." : existing?.status === "rejected" ? "Reenviar" : "Enviar"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchPartner()
    }
  }, [user?.id])

  const fetchPartner = async () => {
    try {
      const res = await fetch(`/api/partners/${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setPartner(data)
        console.log("[v0] Partner loaded:", data)
      } else {
        toast.error("Erro ao carregar dados do parceiro")
      }
    } catch (err) {
      console.error("[v0] Error fetching partner:", err)
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (docType: string, file: File) => {
    if (!partner) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("partnerId", partner.id)
      formData.append("type", docType)
      formData.append("fileName", file.name)

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        await fetchPartner()
        console.log("[v0] Document uploaded successfully")
      } else {
        const error = await res.json()
        toast.error(error.error || "Erro ao enviar documento")
      }
    } catch (err) {
      console.error("[v0] Upload error:", err)
      throw err
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground">Erro ao carregar dados</p>
        </div>
      </div>
    )
  }

  const requiredDocs = getRequiredDocuments(partner.type, partner.mistaSubTypes)
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
              uploading={uploading}
            />
          )
        })}
      </div>
    </div>
  )
}
