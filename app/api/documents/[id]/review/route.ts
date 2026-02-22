import { NextRequest, NextResponse } from "next/server"
import { reviewDocument, addLog } from "@/lib/db/repository"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    console.log("[v0] Document review for:", id)

    // Validate required fields
    if (!body.partnerId || !body.status || !["approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { error: "Partner ID and valid status (approved/rejected) are required" },
        { status: 400 }
      )
    }

    // Optional review note for rejections
    const note = body.status === "rejected" && !body.reviewNote ? "Document rejected" : body.reviewNote

    // Update document status
    await reviewDocument(id, body.partnerId, body.status, note, body.reviewerId || "admin")
    console.log("[v0] Document reviewed:", id, "Status:", body.status)

    // Log the document review
    await addLog({
      userId: body.reviewerId || "admin",
      userType: "admin",
      action: "Document Review",
      details: `Document ${id} ${body.status} for partner ${body.partnerId}${note ? `. Note: ${note}` : ""}`,
    })

    return NextResponse.json(
      {
        success: true,
        message: `Document ${body.status}`,
        documentId: id,
        status: body.status,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Document review error:", error)
    return NextResponse.json(
      { error: "Document review failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}
