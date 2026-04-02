"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare,
  Brain,
  Target,
  CheckCircle,
  Plus,
  ArrowRight,
  FileText,
  Clock,
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
}

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [user, setUser] = React.useState<{ full_name?: string; email?: string } | null>(null)
  const supabase = createClient()

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
        supabase.from('conversations').select('id, title, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5)
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
        recentDecisions: decisionsRes.data || []
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">
                {getGreeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Button asChild>
              <Link href="/chat">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="overflow-hidden shadow-none rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">Memory Items</span>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold tracking-tight">{stats?.memoryCount || 0}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-none rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">Active Goals</span>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold tracking-tight">{stats?.activeGoals || 0}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-none rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">Due Today</span>
                  <Clock className={`h-4 w-4 ${(stats?.dueToday || 0) > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
                <p className="text-3xl font-bold tracking-tight">{stats?.dueToday || 0}</p>
                <p className={`text-xs font-medium mt-1 ${stats?.overdueCount ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {stats?.overdueCount ? `${stats.overdueCount} overdue` : 'On track'}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-none rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">Conversations</span>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold tracking-tight">{stats?.recentConversations.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Recent Conversations</h2>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/chat">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
              <Card className="shadow-none rounded-xl">
                <CardContent className="p-0">
                  {stats?.recentConversations && stats.recentConversations.length > 0 ? (
                    <div className="divide-y border-t-0 p-2">
                      {stats.recentConversations.map((conv) => (
                        <Link key={conv.id} href={`/chat?conversation=${conv.id}`} className="flex items-center gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                            <MessageSquare className="h-4 w-4 text-foreground/80" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{formatDate(conv.updated_at)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-sm text-muted-foreground mb-4">No conversations yet.</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/chat">Start your first chat</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Upcoming Commitments</h2>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/goals">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
              <Card className="shadow-none rounded-xl">
                <CardContent className="p-0">
                  {stats?.upcomingGoals && stats.upcomingGoals.length > 0 ? (
                    <div className="divide-y border-t-0 p-2">
                      {stats.upcomingGoals.map((goal) => {
                        const deadline = getTimeUntilDeadline(goal.deadline)
                        return (
                          <div key={goal.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm">{goal.title}</span>
                            </div>
                            <Badge variant={deadline?.urgent ? "destructive" : "secondary"} className="rounded text-[10px] font-semibold tracking-wide uppercase px-1.5 shadow-none">
                              {deadline?.text}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-sm">
                      <p className="text-muted-foreground mb-4">No active goals</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/goals">Create goal</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Key Decisions</h2>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/memory">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            {stats?.recentDecisions && stats.recentDecisions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {stats.recentDecisions.map((decision) => (
                  <Card key={decision.id} className="shadow-none rounded-xl hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-foreground/80" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{decision.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(decision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-none rounded-xl">
                <CardContent className="p-12 text-center text-sm">
                  <p className="text-muted-foreground mb-4">No decisions logged yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/memory">Log a decision</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/chat" className="rounded-xl border bg-card p-5 hover:border-foreground/20 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-3 text-foreground/80">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">New Chat</p>
              </Link>
              <Link href="/memory" className="rounded-xl border bg-card p-5 hover:border-foreground/20 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-3 text-foreground/80">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">Add Decision</p>
              </Link>
              <Link href="/goals" className="rounded-xl border bg-card p-5 hover:border-foreground/20 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-3 text-foreground/80">
                  <Target className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm">Set Goal</p>
              </Link>
              <Link href="/settings/api-keys" className="rounded-xl border bg-card p-5 hover:border-foreground/20 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-3 text-foreground/80">
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
