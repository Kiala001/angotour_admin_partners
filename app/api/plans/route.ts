import { NextRequest, NextResponse } from "next/server"
import {
  getAllPlans,
  addPlan,
  updatePlan,
  deletePlan,
} from "@/lib/db/repository"

export async function GET() {
  try {
    const plans = await getAllPlans()
    return NextResponse.json(plans)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const plan = await addPlan(body)
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    await updatePlan(id, data)
    return NextResponse.json({ success: true, message: "Plan updated" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    await deletePlan(id)
    return NextResponse.json({ success: true, message: "Plan deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 })
  }
}
