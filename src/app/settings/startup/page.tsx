'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  User, 
  Key, 
  CreditCard, 
  Shield, 
  Plug, 
  BookOpen,
  Rocket,
  Save,
  Loader2,
  ChevronRight,
  TrendingUp,
  Target,
  Globe,
  Building2,
  Calendar,
  Zap,
  Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from "@/lib/utils"

const STAGES = ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'profit']
const INDUSTRIES = ['SaaS', 'E-commerce', 'Fintech', 'HealthTech', 'EdTech', 'AI/ML', 'Consumer', 'B2B', 'Marketplace', 'Hardware', 'Other']

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "Startup Profile", href: "/settings/startup", icon: Rocket },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Integrations", href: "/settings/integrations", icon: Plug },
  { title: "Knowledge Base", href: "/settings/documents", icon: BookOpen },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
]

export default function StartupProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    stage: '',
    founded_date: '',
    website: '',
    tagline: '',
    description: '',
    target_market: '',
    current_challenges: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserProfile({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email
      })

      const { data } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setForm({
          company_name: data.company_name || '',
          industry: data.industry || '',
          stage: data.stage || '',
          founded_date: data.founded_date || '',
          website: data.website || '',
          tagline: data.tagline || '',
          description: data.description || '',
          target_market: data.target_market || '',
          current_challenges: data.current_challenges || ''
        })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('startup_profiles')
        .upsert({
          user_id: user.id,
          ...form,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setMessage('Protocol Saved Successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Update Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className={`pl-64 pt-14`}>
          <div className="flex">
            <div className="w-72 border-r border-border/40 h-[calc(100vh-3.5rem)] sticky top-14 p-8">
              <Skeleton className="h-4 w-24 mb-10" />
              {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="h-12 w-full mb-3 rounded-full" />)}
            </div>
            <div className="flex-1 p-12 max-w-4xl">
              <Skeleton className="h-14 w-64 mb-12 rounded-full" />
              <div className="space-y-6">
                <Skeleton className="h-96 w-full rounded-[3rem]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={userProfile} />
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
                     <Rocket className="h-4 w-4 text-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Context Status</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Establishing a deep business context profile enables more accurate strategic reasoning.</p>
                  <Link href="/startup" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center group">
                     Startup Hub <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-16 max-w-5xl">
            <div className="mb-16 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground font-medium tracking-tight mb-4">
                Entity <span className="text-muted-foreground text-muted-foreground/60">& Identity</span>
              </h1>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Business context protocol active</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-500">
                      <Building2 className="h-7 w-7" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-bold tracking-tight font-medium tracking-tight">Core Repository</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Foundational metadata</p>
                   </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                       <Zap className="h-3 w-3" /> Entity Name
                    </label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={e => setForm({ ...form, company_name: e.target.value })}
                      className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                      placeholder="Company Designation"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                       <TrendingUp className="h-3 w-3" /> Growth Phase
                    </label>
                    <div className="relative">
                      <select
                        value={form.stage}
                        onChange={e => setForm({ ...form, stage: e.target.value })}
                        className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="">Phase Selection</option>
                        {STAGES.map(stage => (
                          <option key={stage} value={stage}>
                            {stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-muted-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                       <Globe className="h-3 w-3" /> Domain Sector
                    </label>
                    <div className="relative">
                      <select
                        value={form.industry}
                        onChange={e => setForm({ ...form, industry: e.target.value })}
                        className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="">Industry Classification</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-muted-foreground/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                       <Calendar className="h-3 w-3" /> Genesis Date
                    </label>
                    <input
                      type="date"
                      value={form.founded_date}
                      onChange={e => setForm({ ...form, founded_date: e.target.value })}
                      className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                     <Plus className="h-3 w-3" /> Corporate Tagline
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={e => setForm({ ...form, tagline: e.target.value })}
                    className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    placeholder="Brief architectural mission statement"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                     <BookOpen className="h-3 w-3" /> Operational Summary
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full p-8 rounded-[2rem] border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none"
                    placeholder="Full business logic overview..."
                  />
                </div>
              </div>

              <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl relative group">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-500">
                      <Target className="h-7 w-7" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-bold tracking-tight font-medium tracking-tight">Market Strategy</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Growth vector analysis</p>
                   </div>
                </div>
                
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                       Target Demographics & Segments
                    </label>
                    <textarea
                      value={form.target_market}
                      onChange={e => setForm({ ...form, target_market: e.target.value })}
                      rows={3}
                      className="w-full p-8 rounded-[2rem] border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none"
                      placeholder="Specify your ideal entity profiles..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-4 flex items-center gap-2">
                       Operational Path Blocks
                    </label>
                    <textarea
                      value={form.current_challenges}
                      onChange={e => setForm({ ...form, current_challenges: e.target.value })}
                      rows={3}
                      className="w-full p-8 rounded-[2rem] border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none"
                      placeholder="What is currently slowing your deployment?"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 pb-12">
                <div className="flex-1">
                  {message && (
                    <div className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      message.includes('Failed') ? 'text-destructive border-destructive/20 bg-destructive/5' : 'text-green-600 border-green-600/20 bg-green-500/5'
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", message.includes('Failed') ? 'bg-destructive' : 'bg-green-500')} />
                      {message}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full px-12 h-16 bg-emphasis text-emphasis-fg hover:bg-primary font-bold text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Synchronizing...' : 'Save Context Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}




