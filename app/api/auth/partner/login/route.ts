import { NextRequest, NextResponse } from "next/server"
import { getPartner, getAllPartners, addLog } from "@/lib/db/repository"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find partner by login email
    const allPartners = await getAllPartners()
    const partner = allPartners.find(
      (p: any) => p.loginEmail === email && p.password === password
    )

    if (!partner) {
      console.log("[v0] Partner login failed: Invalid credentials for", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Partner login successful:", partner.id, email)

    // Log the login
    await addLog({
      userId: partner.id,
      userType: "partner",
      action: "Partner Login",
      details: `Partner ${partner.companyName} logged in from ${email}`,
    })

    return NextResponse.json(
      {
        success: true,
        id: partner.id,
        email: partner.email,
        loginEmail: partner.loginEmail,
        name: partner.companyName,
        companyName: partner.companyName,
        type: partner.type,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Partner login error:", error)
    return NextResponse.json({ error: "Login failed: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 })
  }
}
