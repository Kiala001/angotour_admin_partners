import { NextRequest, NextResponse } from "next/server"
import { addPartner, addLog } from "@/lib/db/repository"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const required = ["type", "companyName", "nif", "phone", "email", "loginEmail", "password", "province", "city", "bairro", "rua"]
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const partner = await addPartner(body)

    // Log the registration
    await addLog({
      userId: partner.id,
      userType: "partner",
      action: "register",
      details: `Partner ${partner.companyName} (${partner.type}) registered`,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        partner: {
          id: partner.id,
          email: partner.email,
          companyName: partner.companyName,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
