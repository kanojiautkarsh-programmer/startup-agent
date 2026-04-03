"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, MessageSquare, Brain, Target, Settings, ChevronLeft, LogOut, Zap, Users, Rocket, Search, Bell, Sun, Moon, Command, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Startup", href: "/startup", icon: Rocket },
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
      <aside className={cn("fixed left-0 top-0 z-40 h-screen border-r border-white/5 bg-[#2D211B] text-white transition-all duration-300", collapsed ? "w-16" : "w-60")}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-white/5 px-4 mb-4">
            <Link href="/" className="flex items-center gap-2 px-1 font-serif font-bold text-2xl tracking-tighter transition-opacity hover:opacity-80">
              {collapsed ? "T" : "TaskLyne"}
            </Link>
          </div>

          <nav className="flex-1 space-y-2 p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const NavIcon = item.icon
              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300", isActive ? "bg-white text-[#2D211B] shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white")}>
                      <NavIcon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white text-black font-semibold border-none">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 group", isActive ? "bg-white text-[#2D211B] font-bold shadow-lg" : "text-white/60 font-medium hover:bg-white/5 hover:text-white")}>
                  <NavIcon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-[#2D211B]" : "text-white/40 group-hover:text-white")} />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/5 p-3 space-y-2 pb-6">
            <Link href="/settings" className={cn("flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 group", pathname.startsWith("/settings") ? "bg-white text-[#2D211B] font-bold shadow-lg" : "text-white/60 font-medium hover:bg-white/5 hover:text-white")}>
              <Settings className={cn("h-5 w-5 transition-transform group-hover:rotate-45", pathname.startsWith("/settings") ? "text-[#2D211B]" : "text-white/40 group-hover:text-white")} />
              {!collapsed && "Settings"}
            </Link>

            {!collapsed && user && (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 mb-2 mt-4">
                <Avatar className="h-8 w-8 ring-2 ring-white/10">
                  <AvatarFallback className="bg-white text-[#2D211B] font-bold text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-tight truncate text-white">{user.full_name || 'User'}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className={cn("flex-1 rounded-xl h-10 hover:bg-red-500/10 hover:text-red-400 group/logout", !collapsed && "justify-start px-4")}>
                    <LogOut className="h-4 w-4 text-white/40 group-hover/logout:text-red-400 transition-colors" />
                    {!collapsed && <span className="ml-3 font-semibold text-xs uppercase tracking-widest">Logout</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right" className="bg-red-500 text-white font-bold border-none">Logout</TooltipContent>}
              </Tooltip>

              {collapsed && (
                <Button variant="ghost" size="sm" onClick={onToggle} className="w-10 h-10 p-0 flex items-center justify-center rounded-xl hover:bg-white/5">
                   <ChevronLeft className="h-4 w-4 text-white/40 rotate-180" />
                </Button>
              )}
            </div>
            
            {!collapsed && (
              <Button variant="ghost" size="sm" onClick={onToggle} className="w-full justify-start px-4 h-10 rounded-xl text-white/40 hover:bg-white/5 hover:text-white group/collapse mt-2">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="ml-3 font-semibold text-xs uppercase tracking-widest">Collapse</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
