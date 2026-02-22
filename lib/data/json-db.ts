import fs from "fs"
import path from "path"
import type { AppState } from "@/lib/types"
import { getInitialState } from "./seed"

const DB_PATH = path.join(process.cwd(), "data", "db.json")

function ensureDir() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function readDB(): AppState {
  ensureDir()
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8")
      return JSON.parse(raw) as AppState
    }
  } catch {
    // corrupted file, reset
  }
  const initial = getInitialState()
  writeDB(initial)
  return initial
}

export function writeDB(state: AppState) {
  ensureDir()
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf-8")
}

export function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
