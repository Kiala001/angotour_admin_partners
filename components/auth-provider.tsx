"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthUser {
  id: string
  email: string
  name: string
  role: "admin" | "partner"
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: "admin" | "partner" }>
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

  const login = async (email: string, password: string) => {
    try {
      // Try admin login first
      const adminRes = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (adminRes.ok) {
        const admin = await adminRes.json()
        const authUser: AuthUser = { id: admin.id, email: admin.email, name: admin.name, role: "admin" }
        setUser(authUser)
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
        return { success: true, role: "admin" as const }
      }

      // Try partner login
      const partnerRes = await fetch("/api/auth/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (partnerRes.ok) {
        const partner = await partnerRes.json()
        const authUser: AuthUser = { id: partner.id, email: partner.loginEmail, name: partner.companyName, role: "partner" }
        setUser(authUser)
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
        return { success: true, role: "partner" as const }
      }

      return { success: false, error: "Email ou senha incorretos" }
    } catch (err) {
      console.error("[v0] Login error:", err)
      return { success: false, error: "Erro ao conectar com o servidor" }
    }
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
