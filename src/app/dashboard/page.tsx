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
              <h1 className="text-3xl font-bold mb-1">
                {getGreeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25">
              <Link href="/chat">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Memory Items</span>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Brain className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{stats?.memoryCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Stored memories</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Active Goals</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Target className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{stats?.activeGoals || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className={`h-1.5 ${(stats?.dueToday || 0) > 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`} />
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Due Today</span>
                  <div className={`p-2 rounded-lg ${(stats?.dueToday || 0) > 0 ? 'bg-red-500/10' : 'bg-violet-500/10'}`}>
                    <Clock className={`h-4 w-4 ${(stats?.dueToday || 0) > 0 ? 'text-red-500' : 'text-violet-500'}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold">{stats?.dueToday || 0}</p>
                <p className={`text-xs mt-1 ${stats?.overdueCount ? 'text-red-500' : 'text-emerald-500'}`}>
                  {stats?.overdueCount ? `${stats.overdueCount} overdue` : 'On track'}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Conversations</span>
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <MessageSquare className="h-4 w-4 text-violet-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{stats?.recentConversations.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total chats</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Conversations
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/chat">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  {stats?.recentConversations && stats.recentConversations.length > 0 ? (
                    <div className="divide-y">
                      {stats.recentConversations.map((conv) => (
                        <Link key={conv.id} href={`/chat?conversation=${conv.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{conv.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{formatDate(conv.updated_at)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No conversations yet</p>
                      <Button variant="link" asChild className="mt-2">
                        <Link href="/chat">Start your first chat</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Upcoming Commitments
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/goals">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
              <Card className="overflow-hidden">
                {stats?.upcomingGoals && stats.upcomingGoals.length > 0 ? (
                  <div className="divide-y">
                    {stats.upcomingGoals.map((goal) => {
                      const deadline = getTimeUntilDeadline(goal.deadline)
                      return (
                        <div key={goal.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-5 w-5 rounded-full border-2 ${deadline?.urgent ? 'border-red-500 bg-red-500/10' : 'border-violet-500 bg-violet-500/10'}`} />
                            <span className="font-medium">{goal.title}</span>
                          </div>
                          <Badge variant={deadline?.urgent ? "destructive" : "secondary"}>
                            {deadline?.text}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="font-medium mb-1">No active goals</p>
                    <p className="text-sm mb-4">Create your first goal to get started</p>
                    <Button asChild size="sm">
                      <Link href="/goals">Create a goal</Link>
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-500" />
                Key Decisions
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/memory">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            <Card className="overflow-hidden">
              {stats?.recentDecisions && stats.recentDecisions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 p-4">
                  {stats.recentDecisions.map((decision) => (
                    <div key={decision.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10">
                          <FileText className="h-4 w-4 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-medium">{decision.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(decision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-medium mb-1">No decisions logged yet</p>
                  <p className="text-sm mb-4">Log your first decision to build memory</p>
                  <Button asChild size="sm">
                    <Link href="/memory">Log a decision</Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/chat">
                <Card className="group hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer h-full">
                  <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                    <div className="p-3 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors mb-3">
                      <MessageSquare className="h-6 w-6 text-violet-500" />
                    </div>
                    <p className="font-medium">New Chat</p>
                    <p className="text-xs text-muted-foreground">Start conversation</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/memory">
                <Card className="group hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer h-full">
                  <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                    <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors mb-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="font-medium">Add Decision</p>
                    <p className="text-xs text-muted-foreground">Log a decision</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/goals">
                <Card className="group hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer h-full">
                  <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                    <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors mb-3">
                      <Target className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="font-medium">Set Goal</p>
                    <p className="text-xs text-muted-foreground">Create new goal</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/settings/api-keys">
                <Card className="group hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer h-full">
                  <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                    <div className="p-3 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors mb-3">
                      <Brain className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="font-medium">Configure Keys</p>
                    <p className="text-xs text-muted-foreground">Manage API keys</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
