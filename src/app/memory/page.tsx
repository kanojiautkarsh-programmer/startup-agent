"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Target,
  Lightbulb,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  History,
  Archive,
  MoreVertical,
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

interface Memory {
  id: string
  type: 'decision' | 'commitment' | 'context' | 'note'
  title: string
  content: string
  created_at: string
  updated_at: string
}

const typeIcons = {
  decision: FileText,
  commitment: Target,
  context: Lightbulb,
  note: History,
}

const typeColors = {
  decision:   "bg-primary text-primary-foreground border-transparent shadow-xl",
  commitment: "bg-primary/10 text-primary border-primary/20",
  context:    "bg-muted/20 text-muted-foreground border-border/40",
  note:       "bg-muted/20 text-muted-foreground border-border/40",
}

const typeBadgeColors = {
  decision:   "bg-primary text-primary-foreground border-transparent",
  commitment: "bg-primary/10 text-primary border-primary/20",
  context:    "bg-muted/20 text-muted-foreground border-border/40",
  note:       "bg-muted/20 text-muted-foreground border-border/40",
}

function Section({ title, icon: Icon, children, defaultOpen = true, count }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
  count: number
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="mb-12 animate-slide-up">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full text-left focus:outline-none group mb-8 px-4"
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
             <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">{count} indexed assets</p>
          </div>
        </div>
        <div className="size-10 rounded-full border border-border/40 flex items-center justify-center hover:bg-muted transition-all shadow-sm">
          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
          {children}
        </div>
      )}
    </div>
  )
}

export default function MemoryPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [memories, setMemories] = React.useState<Memory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [editingMemory, setEditingMemory] = React.useState<Memory | null>(null)
  const [filterType, setFilterType] = React.useState<string>("all")
  const [formData, setFormData] = React.useState<{ type: 'decision' | 'commitment' | 'context' | 'note'; title: string; content: string }>({ type: 'decision', title: '', content: '' })
  const [saving, setSaving] = React.useState(false)
  const supabase = createClient()

  const fetchMemories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setMemories(data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    fetchMemories()
  }, [router])

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingMemory) {
      await supabase
        .from('memories')
        .update({ title: formData.title, content: formData.content, type: formData.type })
        .eq('id', editingMemory.id)
    } else {
      await supabase.from('memories').insert({
        user_id: user.id,
        type: formData.type,
        title: formData.title,
        content: formData.content,
      })
    }

    setFormData({ type: 'decision', title: '', content: '' })
    setEditingMemory(null)
    setAddModalOpen(false)
    await fetchMemories()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('memories').delete().eq('id', id)
    await fetchMemories()
  }

  const handleEdit = (memory: Memory) => {
    setFormData({ type: memory.type, title: memory.title, content: memory.content })
    setEditingMemory(memory)
    setAddModalOpen(true)
  }

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || m.type === filterType
    return matchesSearch && matchesType
  })

  const groupedMemories = {
    decision: filteredMemories.filter(m => m.type === 'decision'),
    commitment: filteredMemories.filter(m => m.type === 'commitment'),
    note: filteredMemories.filter(m => m.type === 'note'),
    context: filteredMemories.filter(m => m.type === 'context'),
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
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)}
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
        "pt-16 transition-all duration-300",
        sidebarCollapsed ? "pl-16" : "pl-64"
      )}>
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 animate-slide-up">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.25em] mb-2">
                <Archive className="size-3" />
                Context Preservation
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Neural <span className="text-muted-foreground/40 font-medium">Archive</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary" />
                  Your startup intelligence is synchronized and up to date.
              </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex items-center gap-2 bg-muted/20 px-6 py-3 rounded-2xl border border-border/40">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 tabular-nums">{memories.length} Indexed Nodes</span>
               </div>
              <button 
                onClick={() => { setEditingMemory(null); setFormData({ type: 'decision', title: '', content: '' }); setAddModalOpen(true) }}
                className="group relative flex items-center gap-3 px-8 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                <Plus className="size-5 group-hover:rotate-90 transition-transform duration-300" />
                Archive Memory
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1 group">
               <div className="absolute inset-0 bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full pointer-events-none" />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
              <input 
                placeholder="Search distributed context..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-14 pl-14 pr-6 rounded-full border border-border/40 bg-card/50 backdrop-blur-xl text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 font-medium relative z-10 shadow-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar shrink-0 items-center px-2">
              {['all', 'decision', 'commitment', 'note', 'context'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-6 h-11 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border",
                    filterType === type 
                      ? "bg-primary text-primary-foreground border-transparent shadow-xl scale-105" 
                      : "bg-card/50 text-muted-foreground/60 border-border/40 hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {groupedMemories.decision.length > 0 && (
              <Section count={groupedMemories.decision.length} title="Operational Decisions" icon={FileText}>
                {groupedMemories.decision.map(memory => (
                  <div key={memory.id} className="premium-glass border border-border/40 rounded-[2.5rem] p-8 md:p-10 hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group flex items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                    <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border", typeColors[memory.type])}>
                      <FileText className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-xl md:text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{memory.title}</h4>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(memory); }} className="size-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"><Edit className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(memory.id); }} className="size-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed mb-8 line-clamp-3 group-hover:line-clamp-none transition-all duration-500 font-medium">{memory.content}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 tabular-nums">
                          Persisted {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {groupedMemories.commitment.length > 0 && (
              <Section count={groupedMemories.commitment.length} title="Strategic Commitments" icon={Target}>
                {groupedMemories.commitment.map(memory => (
                  <div key={memory.id} className="premium-glass border border-border/40 rounded-[2.5rem] p-8 md:p-10 hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group flex items-start gap-8 relative overflow-hidden">
                    <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border", typeColors[memory.type])}>
                      <Target className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-xl md:text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{memory.title}</h4>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(memory); }} className="size-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"><Edit className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(memory.id); }} className="size-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed font-medium">{memory.content}</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {groupedMemories.note.length > 0 && (
              <Section count={groupedMemories.note.length} title="Tactical Notes" icon={History}>
                {groupedMemories.note.map(memory => (
                  <div key={memory.id} className="premium-glass border border-border/40 rounded-[2.5rem] p-8 md:p-10 hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group flex items-start gap-8 relative overflow-hidden">
                    <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border", typeColors[memory.type])}>
                      <History className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-xl md:text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{memory.title}</h4>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(memory); }} className="size-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"><Edit className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(memory.id); }} className="size-10 rounded-full border border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed font-medium">{memory.content}</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {filteredMemories.length === 0 && (
              <div className="py-32 text-center border border-dashed border-border/40 rounded-[3rem] bg-muted/5 animate-slide-up">
                <div className="size-20 rounded-3xl bg-muted/20 border border-border/40 mx-auto flex items-center justify-center mb-10 shadow-xl">
                  <Archive className="size-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-4">Index is empty</h3>
                <p className="text-muted-foreground text-sm mb-12 max-w-sm mx-auto font-medium">Capture your startup's evolution. Begin archiving decisions and strategic commitments.</p>
                <button
                  onClick={() => { setEditingMemory(null); setAddModalOpen(true) }}
                  className="rounded-full px-10 h-14 bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all font-bold text-[10px] uppercase tracking-widest shadow-2xl"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Initial Archive Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 border-border/40 shadow-2xl bg-background/95 backdrop-blur-3xl max-w-2xl">
          <DialogHeader className="mb-10">
            <DialogTitle className="font-bold tracking-tight text-4xl">
              {editingMemory ? 'Refine Memory' : 'Archive Intelligence'}
            </DialogTitle>
            <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mt-3 px-1">Persistence protocol active</p>
          </DialogHeader>
          
          <div className="space-y-10">
            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Classification</label>
              <div className="flex flex-wrap gap-3">
                {(['decision', 'commitment', 'note', 'context'] as const).map(type => (
                  <button 
                    key={type} 
                    onClick={() => setFormData({ ...formData, type })}
                    className={cn(
                      "px-6 h-11 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm border",
                      formData.type === type 
                      ? "bg-primary text-primary-foreground border-transparent" 
                      : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Context Title</label>
              <input 
                placeholder="Brief identifying title..." 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="w-full h-14 px-8 rounded-full border border-border/40 bg-muted/20 text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-medium placeholder:text-muted-foreground/30 shadow-sm"
               />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Intelligence Breakdown</label>
              <textarea 
                placeholder="Record the details of this memory..." 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                className="w-full min-h-[160px] p-8 rounded-[2rem] border border-border/40 bg-muted/20 text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none leading-relaxed font-medium placeholder:text-muted-foreground/30 shadow-sm" 
               />
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
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
              className="rounded-full px-12 h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl disabled:opacity-50 w-full sm:w-auto active:scale-95"
            >
              {saving ? "Indexing..." : editingMemory ? "Commit Update" : "Archive Asset"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
