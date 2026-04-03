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
  User,
  Key,
  CreditCard,
  Shield,
  ArrowRight,
  BookOpen,
  Plug,
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
              <Skeleton className="h-64 w-full mb-6 rounded-[2rem]" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          {/* Settings Navigation */}
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
                Your <span className="italic font-normal">Profile</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">Manage your personal information</p>
            </div>

            <div className="bg-background border border-border/60 rounded-[2rem] p-8 md:p-10 mb-8 hover:border-foreground/20 transition-colors shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10 pb-10 border-b border-border/40">
                <div className="w-24 h-24 rounded-full bg-muted/30 border border-border flex items-center justify-center text-3xl font-serif font-medium text-foreground shrink-0 shadow-inner">
                  {initials}
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-medium mb-1 tracking-tight">{user?.full_name || 'User'}</h2>
                  <p className="text-muted-foreground text-sm font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <input 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                    placeholder="Your name" 
                    className="w-full h-12 px-5 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                  <input 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full h-12 px-5 rounded-full border border-border bg-muted/30 text-sm text-muted-foreground transition-colors cursor-not-allowed" 
                  />
                  <p className="text-[10px] text-muted-foreground/60 font-medium ml-1">Email cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Startup Name</label>
                  <input 
                    value={formData.company} 
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })} 
                    placeholder="Your startup name" 
                    className="w-full h-12 px-5 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors" 
                  />
                </div>

                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="rounded-full px-8 h-11 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium text-sm transition-colors disabled:opacity-50 mt-4 shadow-sm"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </div>

            <div className="bg-background border border-border/60 rounded-[2rem] p-8 md:p-10 hover:border-foreground/20 transition-colors shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-semibold flex items-center gap-3 tracking-tight mb-1.5 text-lg">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Starter
                  </span>
                  Current Plan
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Free tier • Configure your keys in <Link href="/settings/api-keys" className="underline underline-offset-2 hover:text-foreground transition-colors">API Keys</Link>
                </p>
              </div>
              <Link 
                href="/pricing"
                className="rounded-full px-6 h-11 border border-border bg-background hover:bg-muted font-medium text-sm transition-colors inline-flex items-center justify-center whitespace-nowrap shrink-0"
              >
                View Upgrade Plans <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
