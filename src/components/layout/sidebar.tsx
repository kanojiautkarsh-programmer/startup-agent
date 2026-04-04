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
  Users, 
  Rocket, 
  Zap,
  Search,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Startup",   href: "/startup",   icon: Rocket },
  { title: "Chat",      href: "/chat",      icon: MessageSquare },
  { title: "Memory",    href: "/memory",    icon: Brain },
  { title: "Goals",     href: "/goals",     icon: Target },
  { title: "Clients",   href: "/clients",   icon: Users },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  user?: { email?: string; full_name?: string } | null
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
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
          "fixed left-0 top-0 z-40 h-dvh border-r transition-all duration-300 will-change-[width]",
          "premium-glass border-r-border/40",
          collapsed ? "w-16" : "w-64"
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col">

          {/* ── Workspace / Branding ────────────────────────── */}
          <div className="p-3 mb-2 shrink-0">
            <button
              className={cn(
                "w-full flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-muted/50",
                collapsed ? "justify-center" : "bg-card/40 border border-border/40 shadow-sm"
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                <Zap className="size-4" />
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate tracking-tight text-foreground">TaskLyne</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Workspace</p>
                </div>
              )}
              {!collapsed && <ChevronDown className="size-3 text-muted-foreground/60" />}
            </button>
          </div>

          {/* ── Quick Search ────────────────────────────────── */}
          {!collapsed && (
            <div className="px-3 mb-4">
              <button 
                onClick={() => {}} // Placeholder for command palette
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
              >
                <Search className="size-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-left flex-1">Search</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-sans text-[9px] font-bold text-muted-foreground">
                  ⌘K
                </kbd>
              </button>
            </div>
          )}

          {/* ── Nav items ─────────────────────────────────────── */}
          <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar" aria-label="Main navigation">
            {!collapsed && (
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 select-none">
                Intelligence
              </p>
            )}

            {navItems.map((item) => {
              const isActive = pathname === item.href
              const NavIcon  = item.icon
              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.title}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative flex size-10 items-center justify-center rounded-xl transition-all duration-200 mx-auto group",
                        isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <NavIcon className="size-4 relative z-10" aria-hidden="true" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-bold text-xs uppercase tracking-widest px-3 py-1.5">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group relative",
                    isActive 
                      ? "text-foreground font-bold shadow-sm bg-muted/40 obsidian-card-active" 
                      : "text-muted-foreground font-medium hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-all duration-300",
                    isActive ? "bg-primary/10 text-primary" : "bg-transparent group-hover:bg-muted"
                  )}>
                    <NavIcon className="size-4 shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  </div>
                  <span className="flex-1">{item.title}</span>
                  {isActive && (
                     <div className="absolute left-[-1px] top-3 bottom-3 w-[2px] bg-primary rounded-full" aria-hidden="true" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Bottom section ────────────────────────────────── */}
          <div className="p-3 space-y-2 shrink-0 border-t border-border/40">
            {/* User Profile */}
            {!collapsed && user && (
              <div className="group relative flex items-center gap-3 p-2 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-border/40 cursor-pointer">
                <Avatar className="size-8 ring-1 ring-border/60 group-hover:ring-primary/40 transition-all duration-300">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{user.full_name || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter">{user.email}</p>
                </div>
                <ChevronLeft className="size-3 text-muted-foreground/40 group-hover:text-primary transition-all rotate-[-90deg]" />
              </div>
            )}

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex-1 rounded-xl h-10 transition-all hover:bg-destructive/10 hover:text-destructive group",
                      collapsed ? "px-0" : "justify-start px-3"
                    )}
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    {!collapsed && <span className="ml-2 text-xs font-bold uppercase tracking-widest">Power Off</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Power Off</TooltipContent>}
              </Tooltip>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="size-10 p-0 flex items-center justify-center rounded-xl bg-muted/30 hover:bg-muted/50 transition-all border border-border/40"
              >
                <ChevronLeft className={cn("size-4 transition-transform duration-500", collapsed && "rotate-180")} />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
