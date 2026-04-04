import { Metadata } from "next";
"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your TaskLyne account and team workspace."
};

  User,
  Key,
  CreditCard,
  Shield,
  ArrowRight,
  BookOpen,
  Plug,
  Settings,
  ChevronRight,
  Sparkles,
  Zap,
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

export default function SettingsPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ full_name?: string; email?: string; company?: string } | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({ full_name: '', company: '' })
  const supabase = createClient()

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email,
        company: profile?.company
      })
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        company: profile?.company || ''
      })
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.auth.updateUser({
      data: { full_name: formData.full_name }
    })

    await supabase
      .from('profiles')
      .update({ 
        full_name: formData.full_name,
        company: formData.company
      })
      .eq('id', user.id)

    setSaving(false)
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

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
              <Skeleton className="h-96 w-full mb-8 rounded-[3rem]" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
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
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">You are currently using the <span className="font-bold text-foreground">Starter Engine</span>. Upgrade for custom model routing.</p>
                  <Link href="/pricing" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center group">
                     Upgrade Core <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-16 max-w-5xl">
            <div className="mb-16 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground font-medium tracking-tight mb-4">
                Core <span className="text-muted-foreground text-muted-foreground/60">& Identity</span>
              </h1>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">System identity configuration active</p>
              </div>
            </div>

            <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 mb-10 hover:border-primary/20 transition-all shadow-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center gap-10 mb-12 pb-12 border-b border-border/40">
                <div className="w-28 h-28 rounded-[2.5rem] bg-card border border-border shadow-2xl flex items-center justify-center text-4xl font-bold tracking-tight font-medium text-foreground shrink-0 group hover:rotate-3 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-foreground rounded-[2.5rem] opacity-0 group-hover:opacity-10 scale-95 group-hover:scale-105 transition-all duration-500" />
                  {initials}
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight font-medium mb-2 tracking-tight">{user?.full_name || 'System User'}</h2>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-muted border border-border/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{user?.email}</div>
                    <div className="flex items-center gap-1.5 text-primary">
                       <Sparkles className="h-3.5 w-3.5" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Verified Identity</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10 max-w-2xl">
                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <label htmlFor="settings-name" className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 ml-2">Full Name</label>
                  <input
                    id="settings-name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your name"
                    className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-colors duration-150 font-medium placeholder:text-muted-foreground/30 shadow-sm"
                  />
                </div>

                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <label htmlFor="settings-email" className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 ml-2">Email</label>
                  <div className="relative">
                    <input
                      id="settings-email"
                      value={user?.email || ''}
                      disabled
                      className="w-full h-14 px-8 rounded-full border border-border/40 bg-muted/20 text-sm text-muted-foreground/60 transition-colors cursor-not-allowed font-medium shadow-inner"
                    />
                    <Shield className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/20" aria-hidden="true" />
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 font-medium ml-2">Verified — contact support to change your email</p>
                </div>

                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                  <label htmlFor="settings-company" className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 ml-2">Company / Organization</label>
                  <input
                    id="settings-company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company or startup name"
                    className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-colors duration-150 font-medium placeholder:text-muted-foreground/30 shadow-sm"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="group rounded-full px-12 h-14 bg-emphasis text-emphasis-fg hover:bg-primary font-bold text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-2xl active:scale-95 flex items-center gap-3"
                  >
                    {saving ? "Saving..." : "Save changes"}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group hover:bg-card group hover:text-white transition-all duration-500">
                    <Zap className="h-6 w-6" />
                 </div>
                 <div>
                  <h3 className="font-bold flex items-center gap-4 tracking-tight mb-2 text-2xl">
                    Starter <span className="italic font-bold tracking-tight font-normal text-muted-foreground/40 text-lg">Foundation</span>
                  </h3>
                  <p className="text-sm text-muted-foreground/80 font-medium max-w-sm">
                    Configure your high-latency endpoints or upgrade to dedicated compute clusters.
                  </p>
                </div>
              </div>
              <Link 
                href="/pricing"
                className="rounded-full px-10 h-14 bg-card border border-border/60 hover:bg-emphasis hover:text-emphasis-fg hover:border-transparent font-bold text-[10px] uppercase tracking-widest transition-all inline-flex items-center justify-center whitespace-nowrap shrink-0 shadow-sm active:scale-95 group"
              >
                Scale Infrastructure <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}




