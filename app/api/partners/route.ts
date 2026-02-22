import { NextRequest, NextResponse } from "next/server"
import {
  getAllPartners,
  getPartner,
  addPartner,
  updatePartner,
  blockPartner,
} from "@/lib/db/repository"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const partner = await getPartner(id)
      if (!partner) {
        return NextResponse.json({ error: "Partner not found" }, { status: 404 })
      }
      return NextResponse.json(partner)
    }

    const partners = await getAllPartners()
    return NextResponse.json(partners)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const partner = await addPartner(body)
    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create partner" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 })
    }

    await updatePartner(id, data)
    const updated = await getPartner(id)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 })
  }
}
