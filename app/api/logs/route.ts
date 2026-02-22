import { NextRequest, NextResponse } from "next/server"
import { getLogs } from "@/lib/db/repository"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100", 10)

    const logs = await getLogs(Math.max(1, Math.min(limit, 1000)))
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
