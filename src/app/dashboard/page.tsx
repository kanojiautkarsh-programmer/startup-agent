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

      const [memoriesRes, goalsRes, conversationsRes] = await Promise.all([
        supabase.from('memories').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('conversations').select('id, title, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
      ])

      // Mocking business data for now
      const mockBusinessData = {
        clientCount: 14,
        portfolioValue: 42000,
        mrr: 12500
      }

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
        ...mockBusinessData
      })

      setLoading(false)
    }

    fetchData()
  }, [router])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
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
      <div className="min-h-screen bg-background">
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
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
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
        <div className="p-8 max-w-6xl mx-auto">
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight mb-2">
                {getGreeting()}<span className="italic font-normal">{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-wide">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link 
              href="/chat"
              className="rounded-full px-6 h-12 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-colors flex items-center justify-center text-sm shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
             <div className="bg-[#2D211B] rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between group hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-4 opacity-70">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Active Clients</span>
                   <Users className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-3xl font-serif font-medium">{stats?.clientCount || 0}</p>
                   <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60">Revenue accounts</p>
                </div>
             </div>

             <div className="bg-background border border-border/60 rounded-3xl p-6 flex flex-col justify-between group hover:border-foreground/20 transition-colors cursor-pointer shadow-sm">
                <div className="flex items-center justify-between mb-4 text-muted-foreground">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Monthly Revenue</span>
                   <DollarSign className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-3xl font-serif font-medium tabular-nums">${(stats?.mrr || 0).toLocaleString()}</p>
                   <p className="text-[10px] uppercase font-bold tracking-widest mt-1 text-green-600 font-bold flex items-center gap-1">
                     <TrendingUp className="h-2.5 w-2.5" /> +8.4%
                   </p>
                </div>
             </div>

             <div className="bg-background border border-border/60 rounded-3xl p-6 flex flex-col justify-between group hover:border-foreground/20 transition-colors cursor-pointer shadow-sm">
                <div className="flex items-center justify-between mb-4 text-muted-foreground">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Goals Tracking</span>
                   <Target className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-3xl font-serif font-medium">{stats?.activeGoals || 0}</p>
                   <p className="text-[10px] uppercase font-bold tracking-widest mt-1 text-muted-foreground/60">{stats?.dueToday || 0} due this week</p>
                </div>
             </div>

             <div className="bg-background border border-border/60 rounded-3xl p-6 flex flex-col justify-between group hover:border-foreground/20 transition-colors cursor-pointer shadow-sm">
                <div className="flex items-center justify-between mb-4 text-muted-foreground">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Accountability</span>
                   <Brain className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-3xl font-serif font-medium">{stats?.memoryCount || 0}</p>
                   <p className="text-[10px] uppercase font-bold tracking-widest mt-1 text-muted-foreground/60">Logged contexts</p>
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Recent Conversations</h2>
                <Link href="/chat" className="text-xs text-foreground/60 hover:text-foreground transition-colors font-medium flex items-center">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
              <div className="bg-background border rounded-[2rem] overflow-hidden shadow-sm">
                {stats?.recentConversations && stats.recentConversations.length > 0 ? (
                  <div className="divide-y">
                    {stats.recentConversations.map((conv) => (
                      <Link key={conv.id} href={`/chat?conversation=${conv.id}`} className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors group">
                        <div className="w-10 h-10 rounded-full border border-border/60 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background group-hover:border-transparent transition-all">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{conv.title}</p>
                          <p className="text-xs text-muted-foreground truncate tracking-wide mt-0.5">{formatDate(conv.updated_at)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground mb-4 font-medium">No conversations yet.</p>
                    <Link href="/chat" className="text-sm border border-border rounded-full px-6 py-2.5 hover:bg-muted transition-colors font-medium">
                      Start your first chat
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Upcoming Commitments</h2>
                <Link href="/goals" className="text-xs text-foreground/60 hover:text-foreground transition-colors font-medium flex items-center">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
              <div className="bg-background border rounded-[2rem] overflow-hidden">
                {stats?.upcomingGoals && stats.upcomingGoals.length > 0 ? (
                  <div className="divide-y relative">
                    {stats.upcomingGoals.map((goal) => {
                      const deadline = getTimeUntilDeadline(goal.deadline)
                      return (
                        <div key={goal.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className={`w-2 h-2 rounded-full ${deadline?.urgent ? 'bg-destructive/80' : 'bg-green-500/80'}`} />
                            <span className="font-medium text-sm tracking-tight">{goal.title}</span>
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${deadline?.urgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                            {deadline?.text}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground mb-4 font-medium">No active goals</p>
                    <Link href="/goals" className="text-sm border border-border rounded-full px-6 py-2.5 hover:bg-muted transition-colors font-medium">
                      Create goal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Key Decisions</h2>
              <Link href="/memory" className="text-xs text-foreground/60 hover:text-foreground transition-colors font-medium flex items-center">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            {stats?.recentDecisions && stats.recentDecisions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {stats.recentDecisions.map((decision) => (
                  <div key={decision.id} className="bg-background border rounded-[2rem] p-6 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer group flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full border border-border/60 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background group-hover:border-transparent transition-all">
                       <FileText className="h-4 w-4" />
                     </div>
                     <div>
                       <p className="font-medium text-sm">{decision.title}</p>
                       <p className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-wider font-semibold">
                         {new Date(decision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-background border rounded-[2rem] p-12 text-center">
                <p className="text-sm text-muted-foreground mb-4 font-medium">No decisions logged yet.</p>
                <Link href="/memory" className="text-sm border border-border rounded-full px-6 py-2.5 hover:bg-muted transition-colors font-medium">
                  Log a decision
                </Link>
              </div>
            )}
          </div>

          <AnalyticsDashboard />

          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4 px-2">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/chat" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
                <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 text-foreground group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">New Chat</p>
              </Link>
              <Link href="/memory" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
                <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 text-foreground group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">Add Decision</p>
              </Link>
              <Link href="/goals" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
                <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 text-foreground group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">Set Goal</p>
              </Link>
              <Link href="/settings/api-keys" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
                <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 text-foreground group-hover:scale-110 transition-transform">
                  <Brain className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">Configure Keys</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
