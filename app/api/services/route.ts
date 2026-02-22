import { NextRequest, NextResponse } from "next/server"
import {
  getServicesByPartner,
  addService,
  updateService,
  deleteService,
} from "@/lib/db/repository"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get("partnerId")

    if (!partnerId) {
      return NextResponse.json({ error: "partnerId is required" }, { status: 400 })
    }

    const services = await getServicesByPartner(partnerId)
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const service = await addService(body)
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    await updateService(id, data)
    return NextResponse.json({ success: true, message: "Service updated" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    await deleteService(id)
    return NextResponse.json({ success: true, message: "Service deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
