"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Partner, Admin } from "@/lib/types"

interface AuthUser {
  id: string
  email: string
  name: string
  role: "admin" | "partner"
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, partners: Partner[], admins: Admin[]) => { success: boolean; error?: string; role?: "admin" | "partner" }
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const AUTH_KEY = "angotour_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string, partners: Partner[], admins: Admin[]) => {
    const admin = admins.find((a) => a.email === email && a.password === password)
    if (admin) {
      const authUser: AuthUser = { id: admin.id, email: admin.email, name: admin.name, role: "admin" }
      setUser(authUser)
      localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
      return { success: true, role: "admin" as const }
    }

    const partner = partners.find((p) => p.loginEmail === email && p.password === password)
    if (partner) {
      const authUser: AuthUser = { id: partner.id, email: partner.loginEmail, name: partner.companyName, role: "partner" }
      setUser(authUser)
      localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
      return { success: true, role: "partner" as const }
    }

    return { success: false, error: "Email ou senha incorretos" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
  }

  return <AuthContext value={{ user, login, logout, isLoading }}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
