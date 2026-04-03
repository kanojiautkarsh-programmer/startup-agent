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
  ChevronRight,
  Plus,
  Rocket,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { NotionSync } from "@/components/integrations/notion-sync"
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
      <div className="min-h-dvh bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className={`pl-64 pt-14`}>
          <div className="flex">
            <div className="w-72 border-r border-border/40 h-[calc(100vh-3.5rem)] sticky top-14 p-8">
              <Skeleton className="h-4 w-24 mb-10" />
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full mb-3 rounded-full" />)}
            </div>
            <div className="flex-1 p-12 max-w-4xl">
              <Skeleton className="h-14 w-64 mb-12 rounded-full" />
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[3rem]" />)}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={{}} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)]">
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
                        ? "bg-emphasis text-emphasis-fg border-transparent shadow-xl translate-x-2" 
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
                     <Zap className="h-4 w-4 text-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pro Status</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Connect enterprise tools to sync massive vector datasets.</p>
                  <Link href="/pricing" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center group">
                     Scale Core <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-16 max-w-5xl">
            <div className="mb-16 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-serif text-foreground font-medium tracking-tight mb-4">
                Systems <span className="italic font-normal text-muted-foreground/60">& Sync</span>
              </h1>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Distributed context indexing active</p>
              </div>
            </div>

            <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <NotionSync />

              <div className="glass-card border border-border/40 rounded-[3rem] p-8 md:p-10 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-[#24292e] rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <Github className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-medium tracking-tight mb-2">GitHub Repositories</h3>
                      <p className="text-xs text-muted-foreground font-medium">Inject issues, PRs, and codebase architecture into your system context.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnectGitHub}
                    className="rounded-full px-10 h-14 bg-emphasis text-emphasis-fg hover:bg-primary font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 active:scale-95 group"
                  >
                    Sync Repository <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="glass-card border border-border/40 rounded-[3rem] p-8 md:p-10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-[#4A154B] rounded-[1.5rem] flex items-center justify-center shadow-xl">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-medium tracking-tight mb-2">Slack Workspace</h3>
                      <p className="text-xs text-muted-foreground font-medium">Real-time team communication and ephemeral context ingestion.</p>
                    </div>
                  </div>
                  <div className="px-6 py-2 rounded-full bg-muted border border-border/60 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 shadow-inner">
                    Architecture Pending
                  </div>
                </div>
              </div>

              <div className="glass-card border border-border/40 rounded-[3rem] p-8 md:p-10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-[#5E6AD2] rounded-[1.5rem] flex items-center justify-center shadow-xl">
                      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-medium tracking-tight mb-2">Linear Projects</h3>
                      <p className="text-xs text-muted-foreground font-medium">Sync issues, cycles, and product roadmap engineering context.</p>
                    </div>
                  </div>
                  <div className="px-6 py-2 rounded-full bg-muted border border-border/60 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 shadow-inner">
                    Architecture Pending
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}




