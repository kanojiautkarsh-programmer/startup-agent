"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, MessageSquare, Brain, Target, Settings, ChevronLeft, LogOut, Users, Rocket } from "lucide-react"
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
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-dvh border-r border-white/5 bg-[#2D211B] text-white transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-white/5 px-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-1 font-serif font-bold text-2xl tracking-tighter transition-opacity hover:opacity-80"
              aria-label="TaskLyne home"
            >
              {collapsed ? "T" : "TaskLyne"}
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const NavIcon = item.icon
              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.title}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl transition-colors duration-150",
                        isActive ? "bg-white text-[#2D211B] shadow-sm" : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <NavIcon className="size-5" aria-hidden="true" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white text-black font-semibold border-none">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-150",
                    isActive ? "bg-white text-[#2D211B] font-bold shadow-sm" : "text-white/60 font-medium hover:bg-white/5 hover:text-white"
                  )}
                >
                  <NavIcon
                    className={cn("size-5", isActive ? "text-[#2D211B]" : "text-white/40")}
                    aria-hidden="true"
                  />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/5 p-3 space-y-1 pb-6">
            <Link
              href="/settings"
              aria-current={pathname.startsWith("/settings") ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-150",
                pathname.startsWith("/settings")
                  ? "bg-white text-[#2D211B] font-bold shadow-sm"
                  : "text-white/60 font-medium hover:bg-white/5 hover:text-white"
              )}
            >
              <Settings
                className={cn(
                  "size-5 transition-transform duration-200",
                  pathname.startsWith("/settings") ? "text-[#2D211B]" : "text-white/40"
                )}
                aria-hidden="true"
              />
              {!collapsed && "Settings"}
            </Link>

            {!collapsed && user && (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 mb-2 mt-3">
                <Avatar className="size-8 ring-2 ring-white/10">
                  <AvatarFallback className="bg-white text-[#2D211B] font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-tight truncate text-white">{user.full_name || 'User'}</p>
                  <p className="text-[10px] font-medium text-white/40 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    aria-label="Log out"
                    className={cn(
                      "flex-1 rounded-xl h-10 hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-colors duration-150",
                      !collapsed && "justify-start px-4"
                    )}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    {!collapsed && <span className="ml-3 font-semibold text-xs">Logout</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-red-500 text-white font-bold border-none">
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>

              {collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  aria-label="Expand sidebar"
                  className="size-10 p-0 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/40"
                >
                  <ChevronLeft className="size-4 rotate-180" aria-hidden="true" />
                </Button>
              )}
            </div>

            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                aria-label="Collapse sidebar"
                className="w-full justify-start px-4 h-10 rounded-xl text-white/40 hover:bg-white/5 hover:text-white mt-1 transition-colors duration-150"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="ml-3 font-medium text-xs">Collapse</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
