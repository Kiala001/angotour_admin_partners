import { NextRequest, NextResponse } from "next/server"
import { getPartner, updatePartner, addLog, getAllPartners } from "@/lib/db/repository"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("[v0] API GET /partners/[id]: Fetching partner with ID:", id)

    if (!id) {
      console.log("[v0] API GET: No ID provided in params")
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 })
    }

    // Debug: Log all partners to verify data exists
    const allPartners = await getAllPartners()
    console.log("[v0] API GET: Total partners in DB:", allPartners.length)
    if (allPartners.length > 0) {
      console.log("[v0] API GET: First partner ID:", allPartners[0].id)
      console.log("[v0] API GET: Looking for ID:", id)
      console.log("[v0] API GET: IDs match:", allPartners[0].id === id)
    }

    const partner = await getPartner(id)
    console.log("[v0] API GET: getPartner returned:", partner ? "Found" : "Not found")

    if (!partner) {
      console.log("[v0] API GET: Partner not found for ID:", id)
      console.log("[v0] API GET: Available partner IDs:", allPartners.map(p => p.id))
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    console.log("[v0] API GET: Returning partner:", partner.companyName)
    return NextResponse.json(partner)
  } catch (error) {
    console.error("[v0] API GET: Error fetching partner:", error)
    return NextResponse.json(
      { error: "Failed to fetch partner: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("[v0] API PATCH /partners/[id]: Updating partner with ID:", id)

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 })
    }

    const body = await request.json()
    console.log("[v0] API PATCH: Update fields:", Object.keys(body))

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

    const existing = await getPartner(id)
    if (!existing) {
      console.log("[v0] API PATCH: Partner not found for update:", id)
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    await updatePartner(id, body)
    const updated = await getPartner(id)

    // Log the update
    await addLog({
      userId: id,
      userType: "partner",
      action: "Profile Updated",
      details: "Partner profile information updated",
    })

    console.log("[v0] API PATCH: Partner updated successfully")
    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] API PATCH: Error updating partner:", error)
    return NextResponse.json(
      { error: "Failed to update partner: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}

