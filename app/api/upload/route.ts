import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const partnerId = formData.get("partnerId") as string | null
    const docType = formData.get("docType") as string | null

    if (!file || !partnerId) {
      return NextResponse.json({ error: "Ficheiro e partnerId obrigatorios" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de ficheiro nao permitido. Use PDF, JPG ou PNG." }, { status: 400 })
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ficheiro demasiado grande. Maximo 5MB." }, { status: 400 })
    }

    ensureUploadDir()

    // Create partner-specific directory
    const partnerDir = path.join(UPLOAD_DIR, partnerId)
    if (!fs.existsSync(partnerDir)) {
      fs.mkdirSync(partnerDir, { recursive: true })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".pdf"
    const safeName = (docType || "doc").replace(/[^a-zA-Z0-9]/g, "_")
    const fileName = `${safeName}_${Date.now()}${ext}`
    const filePath = path.join(partnerDir, fileName)

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Return the public URL path
    const publicUrl = `/uploads/${partnerId}/${fileName}`

    return NextResponse.json({
      ok: true,
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Erro ao processar o upload" }, { status: 500 })
  }
}
