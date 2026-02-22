import { NextRequest, NextResponse } from "next/server"
import {
  getAllSubscriptions,
  addSubscription,
  reviewSubscription,
} from "@/lib/db/repository"

export async function GET() {
  try {
    const subscriptions = await getAllSubscriptions()
    return NextResponse.json(subscriptions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === "create") {
      const subscription = await addSubscription(data)
      return NextResponse.json(subscription, { status: 201 })
    } else if (action === "review") {
      const { id, status, note, reviewerId } = data
      await reviewSubscription(id, status, note, reviewerId)
      return NextResponse.json({ success: true, message: "Subscription reviewed" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 })
  }
}
