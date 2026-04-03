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
          "fixed left-0 top-0 z-40 h-dvh border-r transition-all duration-200",
          "sidebar-bg",
          collapsed ? "w-16" : "w-60"
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4 mb-2" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
            <Link
              href="/"
              className="flex items-center gap-2 px-1 font-serif font-bold text-2xl tracking-tighter transition-opacity hover:opacity-70"
              style={{ color: 'hsl(var(--sidebar-fg))' }}
              aria-label="TaskLyne home"
            >
              {collapsed ? "T" : "TaskLyne"}
            </Link>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-0.5 p-2" aria-label="Main navigation">
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
                        "flex size-10 items-center justify-center rounded-xl transition-colors duration-150 mx-auto",
                        isActive ? "sidebar-item-active shadow-sm" : "sidebar-item"
                      )}
                    >
                      <NavIcon className="size-4" aria-hidden="true" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150",
                    isActive ? "sidebar-item-active font-semibold shadow-sm" : "sidebar-item font-medium"
                  )}
                >
                  <NavIcon className="size-4 shrink-0" aria-hidden="true" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-2 space-y-0.5 pb-4" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
            <Link
              href="/settings"
              aria-current={pathname.startsWith("/settings") ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 mt-2",
                pathname.startsWith("/settings")
                  ? "sidebar-item-active font-semibold shadow-sm"
                  : "sidebar-item font-medium"
              )}
            >
              <Settings className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && "Settings"}
            </Link>

            {!collapsed && user && (
              <div
                className="flex items-center gap-3 px-3 py-3 rounded-2xl mt-2 mb-1"
                style={{ background: 'hsl(var(--sidebar-item-hover-bg))' }}
              >
                <Avatar className="size-8 ring-1" style={{ '--tw-ring-color': 'hsl(var(--sidebar-border))' } as React.CSSProperties}>
                  <AvatarFallback
                    className="font-bold text-xs"
                    style={{
                      background: 'hsl(var(--sidebar-item-active-bg))',
                      color: 'hsl(var(--sidebar-item-active-fg))'
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-tight truncate" style={{ color: 'hsl(var(--sidebar-fg))' }}>
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-[10px] font-medium truncate" style={{ color: 'hsl(var(--sidebar-item-fg))' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-1 mt-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    aria-label="Log out"
                    className={cn(
                      "flex-1 rounded-xl h-9 sidebar-item hover:text-red-500 transition-colors duration-150",
                      !collapsed && "justify-start px-3"
                    )}
                    style={{ color: 'hsl(var(--sidebar-item-fg))' }}
                  >
                    <LogOut className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="ml-2 text-xs font-medium">Log out</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="font-semibold text-red-500">
                    Log out
                  </TooltipContent>
                )}
              </Tooltip>

              {collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  aria-label="Expand sidebar"
                  className="size-9 p-0 flex items-center justify-center rounded-xl sidebar-item"
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
                className="w-full justify-start px-3 h-9 rounded-xl sidebar-item transition-colors duration-150"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="ml-2 text-xs font-medium">Collapse</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}

