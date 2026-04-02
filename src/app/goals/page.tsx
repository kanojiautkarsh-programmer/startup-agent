"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Target,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Goal {
  id: string
  title: string
  description: string | null
  deadline: string | null
  status: 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  progress: number
  created_at: string
  updated_at: string
}

export default function GoalsPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [goals, setGoals] = React.useState<Goal[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null)
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [saving, setSaving] = React.useState(false)
  const supabase = createClient()

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setGoals(data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    fetchGoals()
  }, [router])

  const handleSave = async () => {
    if (!formData.title.trim()) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingGoal) {
      await supabase
        .from('goals')
        .update({
          title: formData.title,
          description: formData.description || null,
          deadline: formData.deadline || null,
          priority: formData.priority
        })
        .eq('id', editingGoal.id)
    } else {
      await supabase.from('goals').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        deadline: formData.deadline || null,
        priority: formData.priority,
        status: 'active',
        progress: 0
      })
    }

    setFormData({ title: '', description: '', deadline: '', priority: 'medium' })
    setEditingGoal(null)
    setAddModalOpen(false)
    await fetchGoals()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id)
    await fetchGoals()
  }

  const handleEdit = (goal: Goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      priority: goal.priority
    })
    setEditingGoal(goal)
    setAddModalOpen(true)
  }

  const handleComplete = async (goal: Goal) => {
    await supabase
      .from('goals')
      .update({ status: 'completed', progress: 100 })
      .eq('id', goal.id)
    await fetchGoals()
  }

  const handleProgressChange = async (goal: Goal, progress: number) => {
    await supabase
      .from('goals')
      .update({ progress })
      .eq('id', goal.id)
    
    if (progress === 100) {
      await supabase
        .from('goals')
        .update({ status: 'completed' })
        .eq('id', goal.id)
    }
    
    await fetchGoals()
  }

  const filteredGoals = goals.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || g.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const activeGoals = filteredGoals.filter(g => g.status === 'active')
  const completedGoals = filteredGoals.filter(g => g.status === 'completed')

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diff = deadlineDate.getTime() - now.getTime()
    return Math.ceil(diff / 86400000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'low': return 'text-blue-500 bg-blue-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="flex-1 pl-60">
          <div className="p-6 max-w-4xl mx-auto">
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-48 w-full mb-4" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={null} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Goals</h1>
              <p className="text-muted-foreground">Track your progress, hit your targets</p>
            </div>
            <Button onClick={() => { setEditingGoal(null); setFormData({ title: '', description: '', deadline: '', priority: 'medium' }); setAddModalOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search goals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'completed'].map(status => (
                <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Active Goals ({activeGoals.length})</h2>
            {activeGoals.length > 0 ? (
              <div className="space-y-4">
                {activeGoals.map(goal => {
                  const daysLeft = getDaysLeft(goal.deadline)
                  return (
                    <Card key={goal.id} className="p-6 group shadow-none rounded-xl hover:border-border/80 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Target className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{goal.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                                {goal.priority}
                              </Badge>
                              {goal.deadline && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {daysLeft !== null && daysLeft < 0 ? (
                                    <span className="text-red-500">{Math.abs(daysLeft)} days overdue</span>
                                  ) : daysLeft === 0 ? (
                                    <span className="text-red-500">Due today</span>
                                  ) : daysLeft === 1 ? (
                                    <span>Due tomorrow</span>
                                  ) : (
                                    <span>{daysLeft} days left</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleComplete(goal)} title="Mark complete">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                      )}

                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleProgressChange(goal, parseInt(e.target.value))}
                          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleProgressChange(goal, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-16 h-8 text-center"
                        />
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-8 text-center shadow-none rounded-xl border-dashed">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No active goals</h3>
                <p className="text-muted-foreground mb-4">Set your first goal and start tracking your progress.</p>
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first goal
                </Button>
              </Card>
            )}
          </div>

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Completed Goals ({completedGoals.length})</h2>
              <div className="space-y-2">
                {completedGoals.map(goal => (
                  <Card key={goal.id} className="p-4 group shadow-none rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{goal.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Complete</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(goal.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(goal.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input placeholder="What do you want to achieve?" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Textarea placeholder="Add more details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Deadline (optional)</label>
                <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <Button key={p} variant={formData.priority === p ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, priority: p })} className="flex-1">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.title.trim()}>
              {saving ? "Saving..." : editingGoal ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
