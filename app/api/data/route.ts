import { NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/data/json-db"

// GET: Return entire state
export async function GET() {
  const state = readDB()
  return NextResponse.json(state)
}

// POST: Write entire state
export async function POST(req: Request) {
  const state = await req.json()
  writeDB(state)
  return NextResponse.json({ ok: true })
}
