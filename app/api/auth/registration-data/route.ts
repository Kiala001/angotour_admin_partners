import { NextRequest, NextResponse } from "next/server"
import { getAllPlans, getAllPaymentMethods } from "@/lib/db/repository"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching registration data")

    // Get active plans and payment methods
    const allPlans = await getAllPlans()
    const allPaymentMethods = await getAllPaymentMethods()

    const activePlans = allPlans.filter(p => p.active)
    const activePaymentMethods = allPaymentMethods.filter(pm => pm.active)

    console.log("[v0] Registration data loaded:", activePlans.length, "plans,", activePaymentMethods.length, "payment methods")

    return NextResponse.json({
      plans: activePlans,
      paymentMethods: activePaymentMethods,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error fetching registration data:", error)
    return NextResponse.json(
      { error: "Failed to fetch registration data: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}
