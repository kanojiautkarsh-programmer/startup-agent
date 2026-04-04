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
  decision:   "bg-emphasis text-emphasis-fg border-transparent shadow-md",
  commitment: "bg-primary/10 text-primary border-primary/20",
  context:    "bg-muted text-muted-foreground border-border",
  note:       "bg-muted text-muted-foreground border-border",
}

const typeBadgeColors = {
  decision:   "bg-emphasis/10 text-emphasis border-transparent",
  commitment: "bg-primary/10 text-primary border-primary/20",
  context:    "bg-muted-foreground/10 text-muted-foreground border-transparent",
  note:       "bg-muted-foreground/10 text-muted-foreground border-transparent",
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
        className="flex items-center justify-between w-full text-left focus:outline-none group mb-6 px-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-emphasis group-hover:text-emphasis-fg transition-all shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">
            {title} <span className="ml-3 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{count} Assets</span>
          </h3>
        </div>
        <div className="w-8 h-8 rounded-full border border-border/40 flex items-center justify-center hover:bg-muted transition-colors">
          {isOpen ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <main className="flex-1 pl-60">
          <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-12">
               <Skeleton className="h-12 w-64 rounded-full" />
               <Skeleton className="h-12 w-48 rounded-full" />
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

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 animate-slide-up">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight mb-4">
                Memory <span className="italic font-normal text-muted-foreground/60">& Index</span>
              </h1>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Startup context persistence active</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex items-center gap-2 bg-muted/20 px-5 py-2.5 rounded-full border border-border/40">
                  <Archive className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{memories.length} Assets Indexed</span>
               </div>
              <button 
                onClick={() => { setEditingMemory(null); setFormData({ type: 'decision', title: '', content: '' }); setAddModalOpen(true) }}
                className="group rounded-full px-8 h-14 bg-emphasis text-emphasis-fg hover:bg-emphasis-hover font-bold transition-all flex items-center justify-center text-sm shadow-2xl hover:scale-105 active:scale-95"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Archive Memory
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-[#2D211B]/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full shadow-inner" />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
              <input 
                placeholder="Search distributed context..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-14 pl-14 pr-6 rounded-full border border-border/60 bg-card text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 font-medium relative z-10 shadow-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar shrink-0 items-center px-2">
               <div className="flex items-center gap-2 mr-4 text-muted-foreground/40">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
               </div>
              {['all', 'decision', 'commitment', 'note', 'context'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-6 h-11 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border",
                    filterType === type 
                      ? "bg-emphasis text-emphasis-fg border-transparent shadow-xl scale-105" 
                      : "bg-card text-muted-foreground/60 border-border/60 hover:bg-muted/30 hover:text-foreground hover:border-foreground/10"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {groupedMemories.decision.length > 0 && (
              <Section count={groupedMemories.decision.length} title="Operational Decisions" icon={FileText}>
                {groupedMemories.decision.map(memory => (
                  <div key={memory.id} className="glass-card border border-border/40 rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group flex items-start gap-6 relative">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border", typeColors[memory.type])}>
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">{memory.title}</p>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => handleEdit(memory)} className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-emphasis hover:text-emphasis-fg hover:border-transparent transition-all">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(memory.id)} className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-transparent transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground/80 leading-[1.7] mb-6 line-clamp-3 group-hover:line-clamp-none transition-all duration-500 font-medium">{memory.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border", typeBadgeColors[memory.type])}>
                          {memory.type}
                        </span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/30 tabular-nums">
                          {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {groupedMemories.commitment.length > 0 && (
              <Section count={groupedMemories.commitment.length} title="Strategic Commitments" icon={Target}>
                {groupedMemories.commitment.map(memory => (
                  <div key={memory.id} className="glass-card border border-border/40 rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group flex items-start gap-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border", typeColors[memory.type])}>
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">{memory.title}</p>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => handleEdit(memory)} className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-emphasis hover:text-emphasis-fg transition-all"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(memory.id)} className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground/80 leading-[1.7] mb-6 font-medium">{memory.content}</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {groupedMemories.note.length > 0 && (
              <Section count={groupedMemories.note.length} title="Tactical Notes" icon={History}>
                {groupedMemories.note.map(memory => (
                  <div key={memory.id} className="glass-card border border-border/40 rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group flex items-start gap-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border", typeColors[memory.type])}>
                      <History className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">{memory.title}</p>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => handleEdit(memory)} className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-emphasis hover:text-emphasis-fg transition-all"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(memory.id)} className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground/80 leading-[1.7] font-medium">{memory.content}</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {filteredMemories.length === 0 && (
              <div className="py-24 text-center border border-dashed border-border/60 rounded-[3rem] bg-muted/5 animate-slide-up">
                <div className="w-20 h-20 rounded-[2rem] bg-card border border-border/40 mx-auto flex items-center justify-center mb-10 shadow-xl">
                  <Archive className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h3 className="text-3xl font-serif font-medium mb-4 tracking-tight">Index is empty</h3>
                <p className="text-muted-foreground text-sm mb-12 max-w-sm mx-auto font-medium italic font-serif">Capture your startup's evolution. Begin archiving decisions and strategic commitments.</p>
                <button
                  onClick={() => { setEditingMemory(null); setAddModalOpen(true) }}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-10 h-14 bg-emphasis text-emphasis-fg hover:bg-primary transition-all font-bold text-xs uppercase tracking-widest shadow-2xl active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  Initial Archive Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border-border/40 shadow-2xl bg-popover max-w-2xl">
          <DialogHeader className="mb-10">
            <DialogTitle className="font-serif text-4xl font-medium tracking-tight">
              {editingMemory ? 'Refine Memory' : 'Archive Intelligence'}
            </DialogTitle>
            <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-widest mt-3 px-1">Persistence protocol active</p>
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
                      ? "bg-emphasis text-emphasis-fg border-transparent" 
                      : "bg-card border-border/60 text-muted-foreground/60 hover:border-foreground/30 hover:text-foreground"
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
                className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-medium placeholder:text-muted-foreground/30 shadow-sm"
               />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4 block px-2">Intelligence Breakdown</label>
              <textarea 
                placeholder="Record the details of this memory..." 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                className="w-full min-h-[160px] p-8 rounded-[2rem] border border-border/60 bg-card text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none leading-relaxed font-medium placeholder:text-muted-foreground/30 shadow-sm" 
               />
            </div>
          </div>

          <DialogFooter className="mt-12 gap-4">
            <button 
              onClick={() => setAddModalOpen(false)}
              className="rounded-full px-10 h-14 border border-border/60 hover:bg-muted font-bold text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto"
            >
              Discard
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
              className="rounded-full px-12 h-14 bg-emphasis text-emphasis-fg hover:bg-primary font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl disabled:opacity-50 w-full sm:w-auto active:scale-95"
            >
              {saving ? "Indexing..." : editingMemory ? "Commit Update" : "Archive Asset"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




