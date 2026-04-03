"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Target,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit,
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
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-500 dark:bg-yellow-500/10 dark:border-yellow-500/20'
      case 'low': return 'text-muted-foreground bg-muted border-border'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="flex-1 pl-60">
          <div className="p-8 max-w-4xl mx-auto">
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-12 w-full mb-8 rounded-full" />
            <Skeleton className="h-48 w-full mb-4 rounded-3xl" />
            <Skeleton className="h-48 w-full mb-4 rounded-3xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={null} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-serif text-foreground font-medium tracking-tight mb-2">
                Your <span className="italic font-normal">Goals</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">Track your strategic progress</p>
            </div>
            <button 
              onClick={() => { setEditingGoal(null); setFormData({ title: '', description: '', deadline: '', priority: 'medium' }); setAddModalOpen(true) }}
              className="rounded-full px-6 h-12 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-colors flex items-center justify-center text-sm shadow-sm shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search goals..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-12 pl-11 pr-4 rounded-full border border-border/60 bg-muted/10 text-sm focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0 items-center">
              {['all', 'active', 'completed'].map(status => (
                <button 
                  key={status} 
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 h-10 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterStatus === status 
                      ? "bg-foreground text-background border-transparent" 
                      : "bg-background text-foreground/70 border border-border/60 hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 px-2">
               <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Active Goals</h2>
               <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">{activeGoals.length}</span>
            </div>
            
            {activeGoals.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {activeGoals.map(goal => {
                  const daysLeft = getDaysLeft(goal.deadline)
                  return (
                    <div key={goal.id} className="p-6 md:p-8 rounded-[2rem] bg-muted/20 border border-border/60 hover:border-foreground/20 hover:shadow-sm transition-all group flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full border border-border bg-background flex items-center justify-center shrink-0">
                              <Target className="h-5 w-5 text-foreground/80" />
                            </div>
                            <div className="pt-1">
                              <h3 className="font-semibold text-foreground text-base tracking-tight">{goal.title}</h3>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(goal.priority)}`}>
                                  {goal.priority}
                                </span>
                                {goal.deadline && (
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 opacity-70" />
                                    {daysLeft !== null && daysLeft < 0 ? (
                                      <span className="text-destructive">{Math.abs(daysLeft)}d overdue</span>
                                    ) : daysLeft === 0 ? (
                                      <span className="text-destructive">Due today</span>
                                    ) : daysLeft === 1 ? (
                                      <span>1d left</span>
                                    ) : (
                                      <span>{daysLeft}d left</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {goal.description && (
                          <p className="text-sm text-muted-foreground/80 mb-6 leading-relaxed line-clamp-2">{goal.description}</p>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Progress</span>
                          <span className="text-xs font-bold font-serif">{goal.progress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-border/50 rounded-full overflow-hidden mb-4 p-0.5">
                          <div 
                            className="h-full bg-foreground rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${goal.progress}%` }} 
                          />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(e) => handleProgressChange(goal, parseInt(e.target.value))}
                            className="flex-1 h-3 rounded-full appearance-none cursor-pointer bg-transparent border accent-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute w-0 h-0 invisible" 
                            // Using standard buttons instead for better UI
                          />
                          <div className="flex gap-2 w-full pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleProgressChange(goal, Math.max(0, goal.progress - 10))} className="flex-1 h-8 rounded-full border border-border text-xs font-semibold hover:bg-muted">-10%</button>
                            <button onClick={() => handleProgressChange(goal, Math.min(100, goal.progress + 10))} className="flex-1 h-8 rounded-full border border-border text-xs font-semibold hover:bg-muted">+10%</button>
                            <button onClick={() => handleComplete(goal)} className="flex-1 h-8 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-foreground/90">Done</button>
                          </div>
                          
                          {/* Control buttons in top right for edit/delete */}
                          <div className="absolute top-6 right-6 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(goal)} className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                             <button onClick={() => handleDelete(goal.id)} className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group/btn"><Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-red-500 transition-colors" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-16 text-center border border-dashed rounded-[2rem] bg-muted/5">
                <div className="w-16 h-16 rounded-full bg-muted/30 border border-border mx-auto flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-muted-foreground opacity-70" />
                </div>
                <h3 className="text-lg font-serif font-medium mb-2">No active goals</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Set your first goal and start tracking your strategic progress.</p>
                <button 
                  onClick={() => setAddModalOpen(true)}
                  className="rounded-full px-6 h-11 border border-border bg-background hover:bg-muted transition-colors font-medium text-sm inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first goal
                </button>
              </div>
            )}
          </div>

          {completedGoals.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6 px-2">
                 <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Completed</h2>
                 <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">{completedGoals.length}</span>
              </div>
              <div className="space-y-3">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="p-4 md:p-5 rounded-[1.5rem] bg-background border hover:border-foreground/30 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-medium text-sm line-through text-muted-foreground">{goal.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 hidden sm:inline-block">
                        {new Date(goal.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button onClick={() => handleDelete(goal.id)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group/btn opacity-0 group-hover:opacity-100">
                         <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="rounded-[2rem] p-6 pb-8 border-border">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-2xl font-medium tracking-tight">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Title</label>
              <input 
                placeholder="What do you want to achieve?" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="w-full h-12 px-5 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors"
               />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Description</label>
              <textarea 
                placeholder="Add more details..." 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                className="w-full min-h-[100px] p-5 rounded-[1.5rem] border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors resize-none leading-relaxed" 
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Deadline</label>
                <input 
                  type="date" 
                  value={formData.deadline} 
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
                  className="w-full h-12 px-5 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors"
                 />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 h-12 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                        formData.priority === p 
                          ? "bg-foreground text-background" 
                          : "bg-background border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <button 
              onClick={() => setAddModalOpen(false)}
              className="rounded-full px-6 h-11 border border-border hover:bg-muted font-medium text-sm transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving || !formData.title.trim()}
              className="rounded-full px-8 h-11 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium text-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? "Saving..." : editingGoal ? "Update" : "Create Goal"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
