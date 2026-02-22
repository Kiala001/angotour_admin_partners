import { NextRequest, NextResponse } from "next/server"
import { addDocument, reviewDocument } from "@/lib/db/repository"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === "upload") {
      await addDocument(data)
      return NextResponse.json({ success: true, message: "Document uploaded" }, { status: 201 })
    } else if (action === "review") {
      const { docId, partnerId, status, note, reviewerId } = data
      await reviewDocument(docId, partnerId, status, note, reviewerId)
      return NextResponse.json({ success: true, message: "Document reviewed" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
