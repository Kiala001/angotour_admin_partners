import { NextRequest, NextResponse } from "next/server"
import { getAdminByEmail, addLog } from "@/lib/db/repository"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const admin = await getAdminByEmail(email)

    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Log the login action
    await addLog({
      userId: admin.id,
      userType: "admin",
      action: "login",
      details: `Admin ${admin.email} logged in`,
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
