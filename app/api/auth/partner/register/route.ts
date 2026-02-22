import { NextRequest, NextResponse } from "next/server"
import { addPartner, addLog, getAllPartners } from "@/lib/db/repository"
import { PROVINCES, type PartnerType } from "@/lib/types"

const VALID_PARTNER_TYPES = ["Hotel", "Restaurante", "Bar", "Geladaria", "Resort", "Cafeteria", "RentACar", "GuiaTuristico", "Mista"]

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 8
}

function validateNIF(nif: string): boolean {
  return /^[0-9]{10,15}$/.test(nif)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Partner registration attempt:", body.companyName)

    // Validate required fields
    const required = ["type", "companyName", "nif", "phone", "email", "loginEmail", "password", "province", "city", "bairro", "rua"]
    const missing = required.filter(field => !body[field])
    if (missing.length > 0) {
      console.log("[v0] Missing fields:", missing)
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 })
    }

    // Validate partner type
    if (!VALID_PARTNER_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Invalid partner type" }, { status: 400 })
    }

    // Validate company name length
    if (body.companyName.trim().length < 3) {
      return NextResponse.json({ error: "Company name must be at least 3 characters" }, { status: 400 })
    }

    // Validate NIF format and uniqueness
    if (!validateNIF(body.nif)) {
      return NextResponse.json({ error: "NIF must be 10-15 digits" }, { status: 400 })
    }

    // Check NIF uniqueness
    const existingPartners = await getAllPartners()
    if (existingPartners.some(p => p.nif === body.nif)) {
      console.log("[v0] NIF already registered:", body.nif)
      return NextResponse.json({ error: "NIF already registered" }, { status: 409 })
    }

    // Validate emails
    if (!validateEmail(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (!validateEmail(body.loginEmail)) {
      return NextResponse.json({ error: "Invalid login email format" }, { status: 400 })
    }

    // Check email uniqueness
    if (existingPartners.some(p => p.email === body.email || p.loginEmail === body.loginEmail)) {
      console.log("[v0] Email already registered:", body.loginEmail)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Validate password
    if (!validatePassword(body.password)) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Validate province
    if (!PROVINCES.includes(body.province)) {
      return NextResponse.json({ error: "Invalid province" }, { status: 400 })
    }

    // Validate city, bairro, rua
    if (body.city.trim().length < 2) {
      return NextResponse.json({ error: "City must be at least 2 characters" }, { status: 400 })
    }
    if (body.bairro.trim().length < 2) {
      return NextResponse.json({ error: "Bairro must be at least 2 characters" }, { status: 400 })
    }
    if (body.rua.trim().length < 2) {
      return NextResponse.json({ error: "Rua must be at least 2 characters" }, { status: 400 })
    }

    // If Mista type, validate sub-types
    if (body.type === "Mista" && body.mistaSubTypes) {
      if (!Array.isArray(body.mistaSubTypes) || body.mistaSubTypes.length === 0) {
        return NextResponse.json({ error: "Mista type requires at least one sub-type" }, { status: 400 })
      }
      const invalidSubTypes = body.mistaSubTypes.filter((st: string) => !VALID_PARTNER_TYPES.includes(st) || st === "Mista")
      if (invalidSubTypes.length > 0) {
        return NextResponse.json({ error: "Invalid Mista sub-types" }, { status: 400 })
      }
    }

    // Create the partner
    const partner = await addPartner(body)
    console.log("[v0] Partner registered successfully:", partner.id)

    // Log the registration
    await addLog({
      userId: partner.id,
      userType: "partner",
      action: "Partner Registration",
      details: `Partner ${partner.companyName} (${partner.type}) registered from ${body.province}, ${body.city}`,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        partner: {
          id: partner.id,
          email: partner.email,
          loginEmail: partner.loginEmail,
          companyName: partner.companyName,
          type: partner.type,
          licenseExpiry: partner.licenseExpiry,
          documentsStatus: partner.documentsStatus,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 })
  }
}
