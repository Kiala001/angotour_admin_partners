"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useStore } from "@/lib/data/store"
import { PARTNER_TYPE_LABELS, PARTNER_TYPE_MENUS, type PartnerType } from "@/lib/types"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, FileText, BarChart3, CreditCard, User, Crown, LogOut,
  MapPin, Bed, ConciergeBell, Tag, UtensilsCrossed, GlassWater, BookOpen,
  Wine, Sandwich, Calendar, IceCreamCone, Coffee, Cookie, Car, Receipt,
  Map, Package, Star, Activity,
} from "lucide-react"

const ICON_MAP: Record<string, React.ReactNode> = {
  bed: <Bed className="h-4 w-4" />,
  "concierge-bell": <ConciergeBell className="h-4 w-4" />,
  tag: <Tag className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  utensils: <UtensilsCrossed className="h-4 w-4" />,
  "cup-soda": <GlassWater className="h-4 w-4" />,
  "book-open": <BookOpen className="h-4 w-4" />,
  wine: <Wine className="h-4 w-4" />,
  sandwich: <Sandwich className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  "ice-cream-cone": <IceCreamCone className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
  cookie: <Cookie className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  receipt: <Receipt className="h-4 w-4" />,
  map: <Map className="h-4 w-4" />,
  package: <Package className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />,
}

const DEFAULT_ITEMS = [
  { label: "Dashboard", href: "/partner/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Documentos", href: "/partner/documents", icon: <FileText className="h-4 w-4" /> },
  { label: "Estatisticas", href: "/partner/statistics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Metodos de Pagamento", href: "/partner/payment-methods", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Planos", href: "/partner/plans", icon: <Crown className="h-4 w-4" /> },
  { label: "Perfil", href: "/partner/profile", icon: <User className="h-4 w-4" /> },
]

const LIMITED_ITEMS = [
  { label: "Dashboard", href: "/partner/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Documentos", href: "/partner/documents", icon: <FileText className="h-4 w-4" /> },
  { label: "Planos", href: "/partner/plans", icon: <Crown className="h-4 w-4" /> },
  { label: "Perfil", href: "/partner/profile", icon: <User className="h-4 w-4" /> },
]

function getTypeMenuItems(type: PartnerType, mistaSubTypes?: PartnerType[]) {
  if (type === "Mista" && mistaSubTypes) {
    const seen = new Set<string>()
    const items: { label: string; href: string; icon: React.ReactNode }[] = []
    for (const st of mistaSubTypes) {
      if (st !== "Mista" && PARTNER_TYPE_MENUS[st]) {
        for (const item of PARTNER_TYPE_MENUS[st]) {
          if (!seen.has(item.label)) {
            seen.add(item.label)
            items.push({ ...item, icon: ICON_MAP[item.icon] || <Tag className="h-4 w-4" /> })
          }
        }
      }
    }
    return items
  }
  if (type !== "Mista" && PARTNER_TYPE_MENUS[type]) {
    return PARTNER_TYPE_MENUS[type].map((item) => ({
      ...item,
      icon: ICON_MAP[item.icon] || <Tag className="h-4 w-4" />,
    }))
  }
  return []
}

export function PartnerSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { state } = useStore()

  const partner = state.partners.find((p) => p.id === user?.id)
  const isApproved = partner?.documentsStatus === "approved"
  const baseItems = isApproved ? DEFAULT_ITEMS : LIMITED_ITEMS
  const typeItems = partner && isApproved ? getTypeMenuItems(partner.type, partner.mistaSubTypes) : []

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/partner/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <MapPin className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">Angotour</span>
            <span className="text-xs text-sidebar-foreground/70">
              {partner ? PARTNER_TYPE_LABELS[partner.type] : "Parceiro"}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu Principal</SidebarGroupLabel>
          <SidebarMenu>
            {baseItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {typeItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60">
              {partner ? PARTNER_TYPE_LABELS[partner.type] : "Especifico"}
            </SidebarGroupLabel>
            <SidebarMenu>
              {typeItems.map((item) => (
                <SidebarMenuItem key={item.href + item.label}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href.split("?")[0])}>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-bold">
            {user?.name?.charAt(0) || "P"}
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
