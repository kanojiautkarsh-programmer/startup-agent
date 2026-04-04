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
  ArrowUpRight,
  Trophy,
  Filter,
  Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

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
      case 'medium': return 'text-primary bg-primary/10 border-primary/20'
      case 'low': return 'text-muted-foreground bg-muted/10 border-border/40'
      default: return 'text-muted-foreground bg-muted/10 border-border/40'
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="flex-1 pl-64">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
               <Skeleton className="h-12 w-64 rounded-xl" />
               <Skeleton className="h-12 w-48 rounded-xl" />
            </div>
            <Skeleton className="h-14 w-full mb-12 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-[2.5rem]" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={null} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={cn(
        "pt-16 transition-all duration-500",
        sidebarCollapsed ? "pl-16" : "pl-64"
      )}>
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 animate-slide-up">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.25em] mb-2">
                <Target className="size-3" />
                Strategic Objectives
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Execution <span className="text-muted-foreground/40 font-medium">Matrix</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary" />
                  Your workspace intelligence is synchronized and up to date.
              </p>
            </div>
            <button 
              onClick={() => { setEditingGoal(null); setFormData({ title: '', description: '', deadline: '', priority: 'medium' }); setAddModalOpen(true) }}
              className="group relative flex items-center gap-3 px-8 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              <Plus className="size-5 group-hover:rotate-90 transition-transform duration-300" />
              Define Objective
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full pointer-events-none" />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
              <input 
                placeholder="Search strategic objectives..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-14 pl-14 pr-6 rounded-full border border-border/40 bg-card/50 backdrop-blur-xl text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 font-medium relative z-10 shadow-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar shrink-0 items-center px-4">
              {['all', 'active', 'completed'].map(status => (
                <button 
                  key={status} 
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-6 h-11 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border",
                    filterStatus === status 
                      ? "bg-primary text-primary-foreground border-transparent shadow-xl scale-105" 
                      : "bg-card/50 text-muted-foreground/60 border-border/40 hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <div className="flex items-center gap-4 mb-10 px-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
               <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground/60">Active Objectives</h2>
               <span className="bg-primary/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">{activeGoals.length} Pending</span>
            </div>
            
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {activeGoals.map((goal, idx) => {
                  const daysLeft = getDaysLeft(goal.deadline)
                  return (
                    <div key={goal.id} className="premium-glass rounded-[3rem] p-8 md:p-10 border border-border/40 hover:border-primary/20 hover:shadow-2xl transition-all group flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
                      
                      <div>
                        <div className="flex items-start justify-between mb-8">
                          <div className="flex items-start gap-6">
                            <div className="w-14 h-14 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500">
                              <Target className="h-6 w-6" />
                            </div>
                            <div className="pt-1">
                              <h3 className="font-bold text-xl md:text-2xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">{goal.title}</h3>
                              <div className="flex items-center gap-3 mt-4 flex-wrap">
                                <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border transition-all", getPriorityColor(goal.priority))}>
                                  {goal.priority} priority
                                </span>
                                {goal.deadline && (
                                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 group-hover:text-muted-foreground transition-colors px-2">
                                    <Calendar className="h-3 w-3" />
                                    {daysLeft !== null && daysLeft < 0 ? (
                                      <span className="text-destructive font-bold">{Math.abs(daysLeft)}D overdue</span>
                                    ) : daysLeft === 0 ? (
                                      <span className="text-destructive font-bold">Due today</span>
                                    ) : (
                                      <span>T-{daysLeft}D remaining</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                               <button onClick={() => handleEdit(goal)} className="w-10 h-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"><Edit className="h-4 w-4" /></button>
                               <button onClick={() => handleDelete(goal.id)} className="w-10 h-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>

                        {goal.description && (
                          <p className="text-sm md:text-base text-muted-foreground/80 mb-10 leading-relaxed font-medium line-clamp-2">{goal.description}</p>
                        )}
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4 px-2">
                           <div className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">Operational Velocity</span>
                           </div>
                           <span className="text-sm font-bold tracking-tight px-3 py-1 rounded-full bg-primary/5 text-primary tabular-nums">{goal.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden mb-8 shadow-inner overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,90,0,0.4)]" 
                            style={{ width: `${goal.progress}%` }} 
                          />
                        </div>
                        
                        <div className="flex gap-2 w-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                          <button 
                             onClick={() => handleProgressChange(goal, Math.max(0, goal.progress - 10))} 
                             className="flex-1 h-12 rounded-2xl border border-border/40 bg-muted/20 text-[10px] font-bold uppercase tracking-widest hover:bg-muted/40 transition-all active:scale-95"
                          >
                              -10%
                          </button>
                          <button 
                             onClick={() => handleProgressChange(goal, Math.min(100, goal.progress + 10))} 
                             className="flex-1 h-12 rounded-2xl border border-border/40 bg-muted/20 text-[10px] font-bold uppercase tracking-widest hover:bg-muted/40 transition-all active:scale-95"
                          >
                              +10%
                          </button>
                          <button 
                             onClick={() => handleComplete(goal)} 
                             className="flex-[1.5] h-12 rounded-2xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                          >
                              Finalize Goal
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-32 text-center border border-dashed border-border/40 rounded-[3rem] bg-muted/5 animate-slide-up">
                <div className="size-20 rounded-3xl bg-muted/20 border border-border/40 mx-auto flex items-center justify-center mb-10 shadow-xl">
                  <Target className="size-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-4">No active objectives</h3>
                <p className="text-muted-foreground text-sm mb-12 max-w-sm mx-auto font-medium">Establish your next strategic milestone to begin operational tracking.</p>
                <button 
                  onClick={() => { setEditingGoal(null); setAddModalOpen(true) }}
                  className="rounded-full px-10 h-14 bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all font-bold text-[10px] uppercase tracking-widest shadow-2xl"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Define Objective
                </button>
              </div>
            )}
          </div>

          {completedGoals.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-10 px-4">
                 <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground/60">Execution History</h2>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{completedGoals.length} Achieved</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="p-6 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all group flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6 overflow-hidden">
                      <div className="size-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 border border-green-500/20">
                         <Trophy className="size-5" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-lg tracking-tight line-through text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors uppercase decoration-2">{goal.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-end">
                         <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground/20">Achieved On</p>
                         <p className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                           {new Date(goal.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                         </p>
                      </div>
                      <button onClick={() => handleDelete(goal.id)} className="size-10 rounded-full border border-border/40 bg-card/60 flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                         <Trash2 className="size-4" />
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
        <DialogContent className="rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 border-border/40 shadow-2xl bg-background/95 backdrop-blur-3xl max-w-2xl">
          <DialogHeader className="mb-10">
            <DialogTitle className="font-bold tracking-tight text-4xl">
              {editingGoal ? 'Refine Objective' : 'Establish Goal'}
            </DialogTitle>
            <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mt-3 px-1">Tracking configuration protocol</p>
          </DialogHeader>
          <div className="space-y-10">
            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Objective Title</label>
              <input 
                placeholder="What is your primary achievement target?" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="w-full h-14 px-8 rounded-full border border-border/40 bg-muted/20 text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-medium placeholder:text-muted-foreground/30 shadow-sm"
               />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Strategic Context (Optional)</label>
              <textarea 
                placeholder="Supplementary details for operational clarity..." 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                className="w-full min-h-[140px] p-8 rounded-[2rem] border border-border/40 bg-muted/20 text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none leading-relaxed font-medium placeholder:text-muted-foreground/30 shadow-sm" 
               />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Termination Date</label>
                <input 
                  type="date" 
                  value={formData.deadline} 
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
                  className="w-full h-14 px-8 rounded-full border border-border/40 bg-muted/20 text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-medium shadow-sm"
                 />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Priority Level</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={cn(
                         "flex-1 h-14 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border shadow-sm",
                         formData.priority === p 
                            ? "bg-primary text-primary-foreground border-transparent" 
                            : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-12 gap-4">
            <button 
              onClick={() => setAddModalOpen(false)}
              className="rounded-full px-10 h-14 border border-border/40 hover:bg-muted/40 font-bold text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto"
            >
              Discard
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving || !formData.title.trim()}
              className="rounded-full px-12 h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl disabled:opacity-50 w-full sm:w-auto active:scale-95"
            >
              {saving ? "Deploying..." : editingGoal ? "Commit Refinement" : "Deploy Objective"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
