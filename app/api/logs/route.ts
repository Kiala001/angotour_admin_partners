import { NextRequest, NextResponse } from "next/server"
import { getLogs } from "@/lib/db/repository"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100", 10)
    const userId = searchParams.get("userId")

    const logs = await getLogs(Math.max(1, Math.min(limit, 1000)))
    
    // Filter by userId if provided
    const filtered = userId 
      ? logs.filter((log: any) => log.userId === userId)
      : logs

    console.log("[v0] Returning logs:", filtered.length)
    return NextResponse.json(filtered)
  } catch (error) {
    console.error("[v0] Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
