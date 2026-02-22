import { NextRequest, NextResponse } from "next/server"
import { reviewSubscription, addLog, getPartner, updatePartner } from "@/lib/db/repository"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    console.log("[v0] Subscription review for:", id)

    // Validate required fields
    if (!body.status || !["approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { error: "Valid status (approved/rejected) is required" },
        { status: 400 }
      )
    }

    const note = body.reviewNote || (body.status === "rejected" ? "Subscription rejected" : "Subscription approved")

    // Review the subscription
    await reviewSubscription(id, body.status, note, body.reviewerId || "admin")
    console.log("[v0] Subscription reviewed:", id, "Status:", body.status)

    // Log the subscription review
    await addLog({
      userId: body.reviewerId || "admin",
      userType: "admin",
      action: "Subscription Review",
      details: `Subscription ${id} ${body.status}. Note: ${note}`,
    })

    return NextResponse.json(
      {
        success: true,
        message: `Subscription ${body.status}`,
        subscriptionId: id,
        status: body.status,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Subscription review error:", error)
    return NextResponse.json(
      { error: "Subscription review failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}
