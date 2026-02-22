import { NextRequest, NextResponse } from "next/server"
import { getAllAdmins, addLog, saveState, loadState } from "@/lib/db/repository"

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 8
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Admin registration attempt:", body.email)

    // Validate required fields
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password
    if (!validatePassword(body.password)) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Validate name
    if (body.name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 })
    }

    // Check email uniqueness
    const existingAdmins = await getAllAdmins()
    if (existingAdmins.some(a => a.email === body.email)) {
      console.log("[v0] Admin email already registered:", body.email)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Create new admin
    const state = await loadState()
    const adminId = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    
    const newAdmin = {
      id: adminId,
      email: body.email,
      password: body.password, // In production, should be hashed with bcrypt
      name: body.name,
    }

    state.admins.push(newAdmin)
    await saveState(state)
    console.log("[v0] Admin created successfully:", adminId)

    // Log the admin creation
    await addLog({
      userId: "system",
      userType: "admin",
      action: "Admin Registration",
      details: `New admin ${body.name} (${body.email}) created`,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Admin registration successful",
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Admin registration error:", error)
    return NextResponse.json({ error: "Admin registration failed: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 })
  }
}
