'use client'

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Key,
  CreditCard,
  Shield,
  ArrowRight,
  BookOpen,
  Plug,
  Zap,
  Github,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { NotionSync } from "@/components/integrations/notion-sync"

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Integrations", href: "/settings/integrations", icon: Plug },
  { title: "Knowledge Base", href: "/settings/documents", icon: BookOpen },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleConnectGitHub = () => {
    window.location.href = '/api/integrations/github'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="pl-60">
          <div className="flex">
            <div className="w-64 border-r border-border/50 h-[calc(100vh-3.5rem)] sticky top-14 p-6">
              <Skeleton className="h-4 w-16 mb-6" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full mb-2 rounded-full" />)}
            </div>
            <div className="flex-1 p-10 max-w-3xl">
              <Skeleton className="h-10 w-48 mb-8" />
              <Skeleton className="h-48 w-full mb-6 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={{}} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          <div className="w-64 border-r border-border/50 bg-background/50 h-[calc(100vh-3.5rem)] sticky top-14 p-6">
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

          <div className="flex-1 p-8 md:p-12 max-w-4xl">
            <div className="mb-10">
              <h1 className="text-4xl font-serif text-foreground font-medium tracking-tight mb-2">
                <span className="italic font-normal">Integrations</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">
                Connect your tools to supercharge AI context
              </p>
            </div>

            <div className="space-y-6">
              <NotionSync />

              <div className="bg-white rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#24292e] rounded-lg flex items-center justify-center">
                      <Github className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">GitHub</h3>
                      <p className="text-sm text-muted-foreground">Sync issues and pull requests</p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnectGitHub}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80"
                  >
                    Connect GitHub
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6 space-y-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4A154B] rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Slack</h3>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <span className="text-xs bg-muted px-3 py-1 rounded-full">Soon</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6 space-y-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5E6AD2] rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Linear</h3>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <span className="text-xs bg-muted px-3 py-1 rounded-full">Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
