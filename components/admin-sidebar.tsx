"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, Users, FileText, Crown, Receipt, CreditCard,
  BarChart3, Clock, LogOut, MapPin, Shield,
} from "lucide-react"

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Parceiros", href: "/admin/partners", icon: <Users className="h-4 w-4" /> },
  { label: "Documentos", href: "/admin/documents", icon: <FileText className="h-4 w-4" /> },
  { label: "Planos", href: "/admin/plans", icon: <Crown className="h-4 w-4" /> },
  { label: "Subscricoes", href: "/admin/subscriptions", icon: <Receipt className="h-4 w-4" /> },
  { label: "Metodos Pagamento", href: "/admin/payment-methods", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Estatisticas", href: "/admin/statistics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Logs", href: "/admin/logs", icon: <Clock className="h-4 w-4" /> },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <MapPin className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">Angotour</span>
            <span className="flex items-center gap-1 text-xs text-sidebar-foreground/70">
              <Shield className="h-3 w-3" /> Admin
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Gestao</SidebarGroupLabel>
          <SidebarMenu>
            {MENU_ITEMS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-bold">
            A
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
