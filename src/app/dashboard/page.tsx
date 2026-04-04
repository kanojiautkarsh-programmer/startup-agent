"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import { AnalyticsDashboard } from "@/components/analytics/dashboard"
import { useAnalytics } from "@/lib/analytics/useAnalytics"
import {
  MessageSquare,
  Brain,
  Target,
  Plus,
  ArrowRight,
  FileText,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  Plug,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  memoryCount: number
  activeGoals: number
  dueToday: number
  overdueCount: number
  recentConversations: Array<{
    id: string
    title: string
    updated_at: string
  }>
  upcomingGoals: Array<{
    id: string
    title: string
    deadline: string | null
    priority: string
  }>
  recentDecisions: Array<{
    id: string
    title: string
    created_at: string
  }>
  clientCount: number
  portfolioValue: number
  mrr: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [user, setUser] = React.useState<{ full_name?: string; email?: string } | null>(null)
  const [nudgeDismissed, setNudgeDismissed] = React.useState(true) // default true to avoid flash
  const supabase = createClient()
  const { trackPageView } = useAnalytics()

  React.useEffect(() => {
    const dismissed = localStorage.getItem('sa_nudge_tools_dismissed')
    if (!dismissed) setNudgeDismissed(false)
  }, [])

  const dismissNudge = () => {
    localStorage.setItem('sa_nudge_tools_dismissed', '1')
    setNudgeDismissed(true)
  }

  React.useEffect(() => {
    trackPageView('/dashboard')
  }, [])

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser({
        full_name: user.user_metadata?.full_name,
        email: user.email
      })

      const [memoriesRes, goalsRes, conversationsRes, documentsRes] = await Promise.all([
        supabase.from('memories').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('conversations').select('id, title, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
        supabase.from('documents').select('id', { count: 'exact' }).eq('user_id', user.id),
      ])

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 86400000)

      const dueTodayGoals = goalsRes.data?.filter(g => {
        if (!g.deadline) return false
        const deadline = new Date(g.deadline)
        return deadline >= today && deadline < tomorrow
      }) || []

      const overdueGoals = goalsRes.data?.filter(g => {
        if (!g.deadline) return false
        const deadline = new Date(g.deadline)
        return deadline < today
      }) || []

      const decisionsRes = await supabase
        .from('memories')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .eq('type', 'decision')
        .order('created_at', { ascending: false })
        .limit(4)

      setStats({
        memoryCount: memoriesRes.count || 0,
        activeGoals: goalsRes.data?.length || 0,
        dueToday: dueTodayGoals.length,
        overdueCount: overdueGoals.length,
        recentConversations: conversationsRes.data || [],
        upcomingGoals: (goalsRes.data || []).slice(0, 5),
        recentDecisions: decisionsRes.data || [],
        clientCount: conversationsRes.data?.length || 0,
        portfolioValue: memoriesRes.count || 0,
        mrr: documentsRes.count || 0
      })

      setLoading(false)
    }

    fetchData()
  }, [router])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good morning"
    if (hour >= 12 && hour < 17) return "Good afternoon"
    if (hour >= 17 && hour < 21) return "Good evening"
    return "Good night"
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)
    
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTimeUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diff = deadlineDate.getTime() - now.getTime()
    const days = Math.ceil(diff / 86400000)
    
    if (days < 0) return { text: "Overdue", urgent: true }
    if (days === 0) return { text: "Due today", urgent: true }
    if (days === 1) return { text: "Due tomorrow", urgent: true }
    if (days <= 3) return { text: `Due in ${days} days`, urgent: true }
    return { text: `Due ${deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, urgent: false }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="pl-60">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-12 w-36 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} user={user} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="p-8 max-w-6xl mx-auto">
          
          {/* Greeting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-foreground font-medium tracking-tight">
                {getGreeting()}<span className="italic font-normal">{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</span>
              </h1>
              <p className="text-xs font-semibold text-muted-foreground/60 mt-1.5 uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link
              href="/chat"
              className="group rounded-full px-6 h-12 bg-emphasis text-emphasis-fg hover:bg-emphasis-hover font-bold transition-all flex items-center justify-center text-sm shadow-lg hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Session
            </Link>
          </div>

          {/* First-run nudge banner */}
          {!nudgeDismissed && (
            <div className="flex items-center justify-between gap-4 mb-6 px-5 py-3.5 rounded-2xl bg-emphasis/8 border border-emphasis/15 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emphasis text-emphasis-fg">
                  <Plug className="size-3.5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Connect your tools to supercharge the AI</p>
                  <p className="text-[10px] text-muted-foreground/70 font-medium">Link Slack, Notion, or GitHub so I can pull live context automatically.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/settings/integrations"
                  className="text-[10px] font-bold uppercase tracking-widest text-emphasis hover:underline underline-offset-2 whitespace-nowrap"
                >
                  Set up →
                </Link>
                <button
                  onClick={dismissNudge}
                  aria-label="Dismiss"
                  className="flex size-6 items-center justify-center rounded-full hover:bg-muted/60 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-emphasis rounded-3xl p-6 text-emphasis-fg shadow-lg flex flex-col justify-between group hover:scale-[1.02] transition-all cursor-pointer">
                 <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4 opacity-60" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Conversations</span>
                 </div>
                 <div>
                    <p className="text-4xl font-serif font-medium">{stats?.clientCount || 0}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <TrendingUp className="h-3 w-3 text-green-400" />
                       <span className="text-[10px] font-bold text-green-400 tracking-wider">+12% this week</span>
                    </div>
                 </div>
              </div>

              <div className="glass-card border border-border/40 rounded-3xl p-6 flex flex-col justify-between group hover:border-foreground/10 transition-all cursor-pointer">
                 <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <FileText className="h-4 w-4 opacity-60" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Indexed Files</span>
                 </div>
                 <div>
                    <p className="text-4xl font-serif font-medium tabular-nums">{stats?.mrr || 0}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-muted-foreground/60">Across 14 categories</p>
                 </div>
              </div>

              <div className="glass-card border border-border/40 rounded-3xl p-6 flex flex-col justify-between group hover:border-foreground/10 transition-all cursor-pointer">
                 <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Target className="h-4 w-4 opacity-60" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Active Goals</span>
                 </div>
                 <div>
                    <p className="text-4xl font-serif font-medium">{stats?.activeGoals || 0}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-destructive/80">{stats?.dueToday || 0} critical deadlines</p>
                 </div>
              </div>

              <div className="glass-card border border-border/40 rounded-3xl p-6 flex flex-col justify-between group hover:border-foreground/10 transition-all cursor-pointer">
                 <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <Brain className="h-4 w-4 opacity-60" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Memory Assets</span>
                 </div>
                 <div>
                    <p className="text-4xl font-serif font-medium">{stats?.memoryCount || 0}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-muted-foreground/60">Distributed context</p>
                 </div>
              </div>
          </div>

          {/* Recent Conversations + Upcoming Goals */}
          <div className="grid lg:grid-cols-2 gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground/60">Recent Conversations</h2>
                <Link href="/chat" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors flex items-center gap-1">
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="glass-card border border-border/40 rounded-3xl overflow-hidden flex-1">
                {stats?.recentConversations && stats.recentConversations.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {stats.recentConversations.map((conv) => (
                      <Link key={conv.id} href={`/chat?conversation=${conv.id}`} className="flex items-center gap-6 p-6 hover:bg-muted/30 transition-all group">
                        <div className="w-12 h-12 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-emphasis group-hover:text-emphasis-fg group-hover:border-transparent transition-all duration-300">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate tracking-tight mb-1 group-hover:text-primary transition-colors">{conv.title}</p>
                          <p className="text-[11px] text-muted-foreground tabular-nums font-medium tracking-wide">{formatDate(conv.updated_at)}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-lg font-serif italic text-muted-foreground mb-8">Establish a new context.</p>
                    <Link href="/chat" className="inline-flex items-center gap-2 rounded-full px-8 h-12 bg-card border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all">
                      Initial Session
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground/60">Upcoming Goals</h2>
                <Link href="/goals" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors flex items-center gap-1">
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="glass-card border border-border/40 rounded-3xl overflow-hidden flex-1">
                {stats?.upcomingGoals && stats.upcomingGoals.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {stats.upcomingGoals.map((goal) => {
                      const deadline = getTimeUntilDeadline(goal.deadline)
                      return (
                        <div key={goal.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-all">
                          <div className="flex items-center gap-6">
                             <div className={`w-3 h-3 rounded-full ${deadline?.urgent ? 'bg-destructive animate-pulse' : 'bg-green-500'} ring-4 ring-muted/20`} />
                            <span className="font-bold text-sm tracking-tight">{goal.title}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${deadline?.urgent ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-muted-foreground/60'}`}>
                            {deadline?.text}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-lg font-serif italic text-muted-foreground mb-8">Define your strategic horizon.</p>
                    <Link href="/goals" className="inline-flex items-center gap-2 rounded-full px-8 h-12 bg-card border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all text-foreground">
                      Set New Goal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Intelligence Assets */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground/60">Key Intelligence Assets</h2>
              <Link href="/memory" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors flex items-center gap-1">
                Explore <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {stats?.recentDecisions && stats.recentDecisions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {stats.recentDecisions.map((decision) => (
                  <div key={decision.id} className="glass-card border border-border/40 rounded-3xl p-6 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer group flex items-start gap-4">
                     <div className="w-12 h-12 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-emphasis group-hover:text-emphasis-fg group-hover:border-transparent transition-all duration-300">
                       <FileText className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-base tracking-tight mb-1 group-hover:text-primary transition-colors">{decision.title}</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold tabular-nums">
                         {new Date(decision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card border border-border/40 border-dashed rounded-3xl p-12 text-center">
                <p className="text-base font-serif italic text-muted-foreground mb-6">No critical decisions recorded.</p>
                <Link href="/memory" className="inline-flex items-center gap-2 rounded-full px-6 h-11 bg-card border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all text-foreground">
                  Archive Intelligence
                </Link>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
             <AnalyticsDashboard />
          </div>
        </div>
      </main>
    </div>
  )
}




