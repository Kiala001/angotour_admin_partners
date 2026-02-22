import { NextRequest, NextResponse } from "next/server"
import {
  getAllPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/lib/db/repository"

export async function GET() {
  try {
    const methods = await getAllPaymentMethods()
    return NextResponse.json(methods)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const method = await addPaymentMethod(body)
    return NextResponse.json(method, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
    }

    await updatePaymentMethod(id, data)
    return NextResponse.json({ success: true, message: "Payment method updated" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 })
    }

    await deletePaymentMethod(id)
    return NextResponse.json({ success: true, message: "Payment method deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 })
  }
}
