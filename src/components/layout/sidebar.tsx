"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  MessageSquare,
  Brain,
  Target,
  Settings,
  ChevronLeft,
  LogOut,
  Zap,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Chat", href: "/chat", icon: MessageSquare },
  { title: "Memory", href: "/memory", icon: Brain },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Clients", href: "/clients", icon: Users },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  user?: { email?: string; full_name?: string } | null
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn("fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-60")}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 px-1 font-serif font-medium text-xl tracking-tight">
              {collapsed ? (
                 <div className="w-8 h-8 rounded-full bg-[#2D211B] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold leading-none">S</span>
                 </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-[#2D211B] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold leading-none">S</span>
                  </div>
                  <span>TaskLyne</span>
                </>
              )}
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const NavIcon = item.icon
              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={cn("flex h-10 w-10 items-center justify-center rounded-lg transition-colors", isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground")}>
                      <NavIcon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground font-medium hover:bg-accent/50 hover:text-accent-foreground")}>
                  <NavIcon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="border-t p-2 space-y-1">
            <Link href="/settings" className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", pathname === "/settings" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground font-medium hover:bg-accent/50 hover:text-accent-foreground")}>
              <Settings className="h-5 w-5" />
              {!collapsed && "Settings"}
            </Link>

            {!collapsed && user && (
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleLogout} className={cn("w-full", !collapsed && "justify-start px-3")}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">Logout</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>

            <Button variant="ghost" size="sm" onClick={onToggle} className={cn("w-full justify-center", !collapsed && "justify-start px-3")}>
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
