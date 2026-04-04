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
  TrendingUp,
  Zap,
  Calendar,
  Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

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
  const supabase = createClient()
  const { trackPageView } = useAnalytics()

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
        <main className="pl-64">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="space-y-4 mb-10">
              <Skeleton className="h-12 w-64 rounded-xl" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
            <div className="grid grid-cols-4 gap-4 mb-10">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-[2rem]" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/20 transition-colors duration-500">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} user={user} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={cn(
        "pt-16 transition-all duration-500",
        sidebarCollapsed ? "pl-16" : "pl-64"
      )}>
        {/* Daily Brief Gradient Header */}
        <div className="relative border-b border-border/40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-8 py-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.25em] mb-2">
                  <Calendar className="size-3" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  {getGreeting()}<span className="text-muted-foreground/40">{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</span>
                </h1>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary" />
                  TaskLyne intelligence is synchronized and up to date.
                </p>
              </div>
              
              <Link
                href="/chat"
                className="group relative flex items-center gap-3 px-8 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                New Intelligence Session
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          
          {/* Bento Grid v2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Primary Status Card - Full Height */}
            <div className="md:col-span-4 bento-item p-8 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Target className="size-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Strategic Pulse</span>
                    </div>
                    {stats?.dueToday && stats.dueToday > 0 ? (
                      <div className="pulse-dot">
                        <span className="pulse-dot-inner" />
                        <span className="pulse-dot-center" />
                      </div>
                    ) : null}
                 </div>

                 <div className="space-y-1">
                    <p className="text-5xl font-bold tracking-tighter tabular-nums">{stats?.activeGoals || 0}</p>
                    <p className="text-sm font-bold text-muted-foreground">Active strategic goals</p>
                 </div>
               </div>

               <div className="mt-8 pt-8 border-t border-border/40">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-destructive">Critical Deadlines</span>
                    <span className="text-foreground">{stats?.dueToday || 0}</span>
                  </div>
                  <div className="w-full bg-muted/30 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", stats?.dueToday ? "bg-destructive" : "bg-primary")} 
                      style={{ width: `${Math.min((stats?.activeGoals || 0) * 10, 100)}%` }} 
                    />
                  </div>
               </div>
            </div>

            {/* Insight Grid Cards */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bento-item p-8 group cursor-pointer hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <MessageSquare className="size-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Engagement</span>
                  </div>
                  <p className="text-4xl font-bold tracking-tight mb-2 tabular-nums">{stats?.clientCount || 0}</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-3 text-green-400" />
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">+12.5% vs last week</span>
                  </div>
               </div>

               <div className="bento-item p-8 group cursor-pointer hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                      <Brain className="size-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Intelligence</span>
                  </div>
                  <p className="text-4xl font-bold tracking-tight mb-2 tabular-nums">{stats?.memoryCount || 0}</p>
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Contextual assets</span>
               </div>

               {/* Extended MRR Card */}
               <div className="sm:col-span-2 bento-item p-8 flex items-center justify-between group cursor-pointer hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="size-14 rounded-[1.25rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                      <FileText className="size-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Knowledge Density</p>
                      <p className="text-3xl font-bold tracking-tight tabular-nums">{stats?.mrr || 0} <span className="text-sm font-medium text-muted-foreground/40 font-sans tracking-normal">indexed nodes</span></p>
                    </div>
                  </div>
                  <button className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <ArrowRight className="size-5" />
                  </button>
               </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            
            {/* Conversations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground/60">Cognitive Stream</h2>
                <Link href="/chat" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4">Explore Flow →</Link>
              </div>
              
              <div className="premium-glass rounded-[2.5rem] divide-y divide-border/40 overflow-hidden shadow-2xl">
                {stats?.recentConversations && stats.recentConversations.length > 0 ? (
                  stats.recentConversations.map((conv) => (
                    <Link 
                      key={conv.id} 
                      href={`/chat?conversation=${conv.id}`} 
                      className="flex items-center gap-5 p-6 hover:bg-muted/30 transition-all group"
                    >
                      <div className="size-11 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-300">
                        <MessageSquare className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm tracking-tight truncate mb-0.5 group-hover:text-primary transition-colors">{conv.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest tabular-nums">{formatDate(conv.updated_at)}</p>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <p className="shimmer-text font-bold text-sm tracking-widest uppercase">Initializing neural path...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground/60">Execution Matrix</h2>
                <Link href="/goals" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4">Strategic Map →</Link>
              </div>
              
              <div className="premium-glass rounded-[2.5rem] divide-y divide-border/40 overflow-hidden shadow-2xl">
                {stats?.upcomingGoals && stats.upcomingGoals.length > 0 ? (
                  stats.upcomingGoals.map((goal) => {
                    const deadline = getTimeUntilDeadline(goal.deadline)
                    return (
                      <div key={goal.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-all group">
                        <div className="flex items-center gap-5 min-w-0">
                           <div className={cn(
                             "size-2.5 rounded-full ring-4 ring-muted/20 shrink-0",
                             deadline?.urgent ? "bg-destructive animate-pulse-subtle" : "bg-green-500"
                           )} />
                          <span className="font-bold text-sm tracking-tight truncate group-hover:text-primary transition-colors">{goal.title}</span>
                        </div>
                        <span className={cn(
                           "text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shrink-0 transition-colors",
                           deadline?.urgent ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground/60 group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          {deadline?.text}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <p className="shimmer-text font-bold text-sm tracking-widest uppercase">Defining objectives...</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Intelligence Metrics */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
             <AnalyticsDashboard />
          </div>

        </div>
      </main>
    </div>
  )
}
