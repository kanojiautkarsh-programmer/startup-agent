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
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-slide-up">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif text-foreground font-medium tracking-tight mb-4">
                {getGreeting()}<span className="italic font-normal">{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-4 bg-primary rounded-full" />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest tabular-nums">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Link 
              href="/chat"
              className="group rounded-full px-8 h-14 bg-foreground text-background hover:bg-foreground/90 font-bold transition-all flex items-center justify-center text-sm shadow-2xl hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              New Intelligence Session
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-[#2D211B] rounded-[2rem] p-8 text-white shadow-2xl flex flex-col justify-between group hover:scale-[1.03] transition-all cursor-pointer relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageSquare className="h-20 w-20" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                       <span className="w-2 h-2 rounded-full bg-primary" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Total Conversations</span>
                    </div>
                    <div>
                       <p className="text-5xl font-serif font-medium">{stats?.clientCount || 0}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <TrendingUp className="h-3 w-3 text-green-400" />
                          <span className="text-[10px] font-bold text-green-400 tracking-wider">+12% this week</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="glass-card border border-border/40 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-foreground/10 transition-all cursor-pointer relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileText className="h-20 w-20" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                       <span className="w-2 h-2 rounded-full bg-border" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Indexed Files</span>
                    </div>
                    <div>
                       <p className="text-5xl font-serif font-medium tabular-nums">{stats?.mrr || 0}</p>
                       <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-muted-foreground/60">Across 14 categories</p>
                    </div>
                 </div>
              </div>

              <div className="glass-card border border-border/40 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-foreground/10 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Target className="h-20 w-20" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                       <span className="w-2 h-2 rounded-full bg-border" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Active Commitments</span>
                    </div>
                    <div>
                       <p className="text-5xl font-serif font-medium">{stats?.activeGoals || 0}</p>
                       <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-destructive/80 font-bold">{stats?.dueToday || 0} Critical deadlines</p>
                    </div>
                 </div>
              </div>

              <div className="glass-card border border-border/40 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-foreground/10 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Brain className="h-20 w-20" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                       <span className="w-2 h-2 rounded-full bg-border" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Memory Assets</span>
                    </div>
                    <div>
                       <p className="text-5xl font-serif font-medium">{stats?.memoryCount || 0}</p>
                       <p className="text-[10px] uppercase font-bold tracking-widest mt-2 text-muted-foreground/60">Distributed context</p>
                    </div>
                 </div>
              </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground/60">Recent Conversations</h2>
                </div>
                <Link href="/chat" className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/40 hover:text-primary transition-colors flex items-center">
                  Overview <ArrowRight className="h-3 w-3 ml-2" />
                </Link>
              </div>
              <div className="glass-card border border-border/40 rounded-[2.5rem] overflow-hidden flex-1">
                {stats?.recentConversations && stats.recentConversations.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {stats.recentConversations.map((conv) => (
                      <Link key={conv.id} href={`/chat?conversation=${conv.id}`} className="flex items-center gap-6 p-6 hover:bg-muted/30 transition-all group">
                        <div className="w-12 h-12 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background group-hover:border-transparent transition-all duration-300">
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
              <div className="flex items-center justify-between mb-6 px-4">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground/60">Upcoming Tracking</h2>
                <Link href="/goals" className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/40 hover:text-primary transition-colors flex items-center">
                  Strategic View <ArrowRight className="h-3 w-3 ml-2" />
                </Link>
              </div>
              <div className="glass-card border border-border/40 rounded-[2.5rem] overflow-hidden flex-1">
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

          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6 px-4">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground/60">Key Intelligence Assets</h2>
              <Link href="/memory" className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/40 hover:text-primary transition-colors flex items-center">
                Explore Index <ArrowRight className="h-3 w-3 ml-2" />
              </Link>
            </div>
            {stats?.recentDecisions && stats.recentDecisions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {stats.recentDecisions.map((decision) => (
                  <div key={decision.id} className="glass-card border border-border/40 rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group flex items-start gap-6">
                     <div className="w-14 h-14 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                       <FileText className="h-6 w-6" />
                     </div>
                     <div>
                       <p className="font-bold text-lg tracking-tight mb-2 group-hover:text-primary transition-colors">{decision.title}</p>
                       <div className="flex items-center gap-3">
                         <span className="w-1 h-1 bg-border rounded-full" />
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold tabular-nums">
                           Established {new Date(decision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                         </p>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card border border-border/40 border-dashed rounded-[2.5rem] p-16 text-center">
                <p className="text-lg font-serif italic text-muted-foreground mb-8">No critical decisions recorded.</p>
                <Link href="/memory" className="inline-flex items-center gap-2 rounded-full px-8 h-12 bg-card border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all text-black">
                  Archive Intelligence
                </Link>
              </div>
            )}
          </div>

          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
             <AnalyticsDashboard />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground/60 mb-8 px-4">Tactical Operations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link href="/chat" className="group glass-card border border-border/40 h-40 rounded-[2rem] hover:border-primary/40 hover:shadow-2xl transition-all flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 text-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-foreground transition-colors">Intelligence</p>
              </Link>
              <Link href="/memory" className="group glass-card border border-border/40 h-40 rounded-[2rem] hover:border-primary/40 hover:shadow-2xl transition-all flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 text-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-foreground transition-colors">Archive</p>
              </Link>
              <Link href="/goals" className="group glass-card border border-border/40 h-40 rounded-[2rem] hover:border-primary/40 hover:shadow-2xl transition-all flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 text-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500">
                  <Target className="h-5 w-5" />
                </div>
                <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-foreground transition-colors">Strategy</p>
              </Link>
              <Link href="/settings" className="group glass-card border border-border/40 h-40 rounded-[2rem] hover:border-primary/40 hover:shadow-2xl transition-all flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 text-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500">
                  <Brain className="h-5 w-5" />
                </div>
                <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-foreground transition-colors">Context</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}




