import { NextRequest, NextResponse } from "next/server"
import { getPartner, updatePartner, addLog } from "@/lib/db/repository"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching partner:", params.id)
    const partner = await getPartner(params.id)

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    return NextResponse.json(partner)
  } catch (error) {
    console.error("[v0] Error fetching partner:", error)
    return NextResponse.json({ error: "Failed to fetch partner" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("[v0] Updating partner:", params.id)

    // Validate inputs
    if (body.companyName && body.companyName.trim().length < 3) {
      return NextResponse.json({ error: "Company name must be at least 3 characters" }, { status: 400 })
    }

    if (body.phone && body.phone.trim().length < 5) {
      return NextResponse.json({ error: "Phone number invalid" }, { status: 400 })
    }

    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const updatedPartner = await updatePartner(params.id, body)
    
    // Log the update
    await addLog({
      userId: params.id,
      userType: "partner",
      action: "Profile Updated",
      details: "Partner profile information updated",
    })

    console.log("[v0] Partner updated successfully")
    return NextResponse.json(updatedPartner)
  } catch (error) {
    console.error("[v0] Error updating partner:", error)
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 })
  }
}
