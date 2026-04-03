"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { 
  User, 
  Key, 
  CreditCard, 
  Shield, 
  Plug, 
  BookOpen,
  TrendingUp,
  ChevronRight,
  Rocket
} from "lucide-react"
import { SecuritySettings } from '@/components/settings/security-settings'
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "Startup Profile", href: "/settings/startup", icon: Rocket },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Integrations", href: "/settings/integrations", icon: Plug },
  { title: "Knowledge Base", href: "/settings/documents", icon: BookOpen },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
]

export default function SecurityPage() {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  return (
    <div className="min-h-dvh bg-background font-sans flex flex-col selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={{}} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)] mt-14">
          {/* Settings Navigation */}
          <div className="w-72 border-r border-border/40 bg-muted/5 h-[calc(100vh-3.5rem)] sticky top-14 p-8 hidden lg:block animate-slide-in-left">
            <div className="flex items-center gap-3 mb-10 px-4">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">Command Center</h2>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={cn(
                      "flex items-center justify-between group rounded-2xl px-5 h-12 text-sm transition-all font-medium border",
                      isActive 
                        ? "bg-[#2D211B] text-white border-transparent shadow-xl translate-x-2" 
                        : "text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground hover:border-border/40"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground/60")} />
                      <span className={cn(isActive && "font-bold tracking-tight")}>{item.title}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </Link>
                )
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-border/40 px-4">
               <div className="glass-card rounded-2xl p-6 bg-primary/5 border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                     <Shield className="h-4 w-4 text-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary">System Integrity</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Your connection is currently secured with <span className="font-bold text-foreground">SHA-256</span> encryption.</p>
                  <Link href="/faq/security" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center group">
                     Security Docs <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-16 max-w-6xl">
            <SecuritySettings />
          </div>
        </div>
      </main>
    </div>
  )
}



