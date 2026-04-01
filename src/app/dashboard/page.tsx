"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  TrendingUp,
  Clock,
  AlertCircle,
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
      <div className="min-h-screen bg-background flex">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="flex-1 pl-60">
          <div className="p-6 max-w-7xl mx-auto">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
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
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold">
                {getGreeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-muted-foreground">
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
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Memory Items</span>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Brain className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stats?.memoryCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Stored memories</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Active Goals</span>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Target className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stats?.activeGoals || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Due Today</span>
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Clock className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stats?.dueToday || 0}</p>
                <p className="text-xs text-red-500 mt-1">
                  {stats?.overdueCount ? `${stats.overdueCount} overdue` : 'On track'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Conversations</span>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stats?.recentConversations.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Recent chats</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
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
                  <CheckCircle className="h-5 w-5" />
                  Upcoming Commitments
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/goals">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
              <Card>
                <CardContent className="p-4">
                  {stats?.upcomingGoals && stats.upcomingGoals.length > 0 ? (
                    <div className="space-y-3">
                      {stats.upcomingGoals.map((goal) => {
                        const deadline = getTimeUntilDeadline(goal.deadline)
                        return (
                          <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-5 w-5 rounded-full border-2 ${deadline?.urgent ? 'border-red-500' : 'border-muted-foreground'}`} />
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
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No active goals</p>
                      <Button variant="link" asChild className="mt-2">
                        <Link href="/goals">Create a goal</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Key Decisions
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/memory">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                {stats?.recentDecisions && stats.recentDecisions.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {stats.recentDecisions.map((decision) => (
                      <div key={decision.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{decision.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(decision.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No decisions logged yet</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/memory">Log your first decision</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/chat">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                    <p className="font-medium">New Chat</p>
                    <p className="text-xs text-muted-foreground">Start conversation</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/memory">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <p className="font-medium">Add Decision</p>
                    <p className="text-xs text-muted-foreground">Log a decision</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/goals">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Target className="h-8 w-8 mb-2 text-primary" />
                    <p className="font-medium">Set Goal</p>
                    <p className="text-xs text-muted-foreground">Create new goal</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/settings/api-keys">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Brain className="h-8 w-8 mb-2 text-primary" />
                    <p className="font-medium">Configure AI</p>
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
