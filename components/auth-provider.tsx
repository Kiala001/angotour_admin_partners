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
    const hydrate = async () => {
      try {
        const stored = localStorage.getItem(AUTH_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          console.log("[v0] Hydrating user from localStorage:", parsed)
          setUser(parsed)
        }
      } catch (err) {
        console.error("[v0] Error hydrating auth:", err)
      } finally {
        setIsLoading(false)
      }
    }
    hydrate()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Starting login for:", email)
      
      // Try admin login first
      const adminRes = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (adminRes.ok) {
        const admin = await adminRes.json()
        console.log("[v0] Admin login successful:", admin)
        const authUser: AuthUser = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: "admin",
        }
        setUser(authUser)
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
        console.log("[v0] Admin user saved to localStorage:", authUser)
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
        console.log("[v0] Partner login API response:", partner)
        const authUser: AuthUser = {
          id: partner.id,
          email: partner.loginEmail || partner.email,
          name: partner.name || partner.companyName,
          role: "partner",
        }
        setUser(authUser)
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
        console.log("[v0] Partner user saved to localStorage:", authUser)
        return { success: true, role: "partner" as const }
      }

      const error = await adminRes.text()
      console.log("[v0] Login failed:", error)
      return { success: false, error: "Email ou senha incorretos" }
    } catch (err) {
      console.error("[v0] Login error:", err)
      return { success: false, error: "Erro ao conectar com o servidor" }
    }
  }

  const logout = () => {
    console.log("[v0] Logging out user")
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
