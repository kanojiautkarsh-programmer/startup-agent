"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { User, Key, CreditCard, Shield } from "lucide-react"
import { SecuritySettings } from '@/components/settings/security-settings'

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
]

export default function SecurityPage() {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)] mt-14">
          <div className="w-64 border-r border-border/50 bg-background/50 h-[calc(100vh-3.5rem)] sticky top-14 p-6 hidden md:block">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 px-4">Settings</h2>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-4 rounded-full px-4 py-3 text-sm transition-all font-medium ${
                      isActive 
                        ? "bg-foreground text-background shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 max-w-5xl">
            <SecuritySettings />
          </div>
        </div>
      </main>
    </div>
  )
}
