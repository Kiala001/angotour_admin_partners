import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db/seed"

export async function POST() {
  try {
    await initializeDatabase()
    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("[v0] Database initialization failed:", error)
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "To initialize the database, make a POST request to this endpoint",
  })
}
