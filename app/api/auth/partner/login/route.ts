import { NextRequest, NextResponse } from "next/server"
import { getPartner, addLog } from "@/lib/db/repository"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find partner by login email
    const allPartners = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/partners`)
      .then((res) => res.json())
      .catch(() => [])

    const partner = allPartners.find(
      (p: any) => p.loginEmail === email && p.password === password
    )

    if (!partner) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Log the login
    await addLog({
      userId: partner.id,
      userType: "partner",
      action: "login",
      details: `Partner ${partner.companyName} logged in`,
    })

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        email: partner.loginEmail,
        companyName: partner.companyName,
        type: partner.type,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
