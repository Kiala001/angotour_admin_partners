import { NextRequest, NextResponse } from "next/server"
import { blockPartner } from "@/lib/db/repository"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { blocked } = body

    if (typeof blocked !== "boolean") {
      return NextResponse.json({ error: "blocked field must be boolean" }, { status: 400 })
    }

    await blockPartner(id, blocked)
    return NextResponse.json({ success: true, message: `Partner ${blocked ? "blocked" : "unblocked"}` })
  } catch (error) {
    return NextResponse.json({ error: "Failed to block/unblock partner" }, { status: 500 })
  }
}
