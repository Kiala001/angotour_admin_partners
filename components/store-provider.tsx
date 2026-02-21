"use client"

import { useState, useEffect, type ReactNode } from "react"
import { StoreContext, loadState, createActions } from "@/lib/data/store"
import type { AppState } from "@/lib/types"

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null)

  useEffect(() => {
    setState(loadState())
  }, [])

  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const actions = createActions(state, setState)

  return <StoreContext value={actions}>{children}</StoreContext>
}
