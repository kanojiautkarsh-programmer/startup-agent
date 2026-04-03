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
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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
  note: FileText,
}

const typeColors = {
  decision: "bg-muted text-foreground/80 border-border",
  commitment: "bg-muted text-foreground/80 border-border",
  context: "bg-muted text-foreground/80 border-border",
  note: "bg-muted text-foreground/80 border-border",
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
    <div className="mb-6 bg-background">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full text-left focus:outline-none group mb-4 px-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted/30 border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold tracking-wider text-sm uppercase text-muted-foreground group-hover:text-foreground tracking-tight transition-colors">
            {title} <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-[10px]">{count}</span>
          </h3>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" /> : <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />}
      </button>
      {isOpen && (
        <div className="bg-muted/10 border border-border/50 rounded-[2rem] p-2 md:p-4">
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
                Memory <span className="italic font-normal">& Context</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">Your startup's history, always accessible</p>
            </div>
            <button 
              onClick={() => { setEditingMemory(null); setFormData({ type: 'decision', title: '', content: '' }); setAddModalOpen(true) }}
              className="rounded-full px-6 h-12 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-colors flex items-center justify-center text-sm shadow-sm shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Memory
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search memory..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-12 pl-11 pr-4 rounded-full border border-border/60 bg-muted/10 text-sm focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0 items-center">
              {['all', 'decision', 'commitment', 'note', 'context'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setFilterType(type)}
                  className={`px-5 h-10 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterType === type 
                      ? "bg-foreground text-background border-transparent" 
                      : "bg-background text-foreground/70 border border-border/60 hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {groupedMemories.decision.length > 0 && (
              <Section count={groupedMemories.decision.length} title="Decisions" icon={FileText}>
                <div className="space-y-2">
                  {groupedMemories.decision.map(memory => (
                    <div key={memory.id} className="p-4 md:p-5 rounded-[1.5rem] bg-background border hover:border-foreground/30 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-xl border ${typeColors[memory.type]} shrink-0`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{memory.title}</p>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{memory.content}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-3">
                              {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(memory)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleDelete(memory.id)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group/btn">
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {groupedMemories.commitment.length > 0 && (
              <Section count={groupedMemories.commitment.length} title="Commitments" icon={Target}>
                <div className="space-y-2">
                  {groupedMemories.commitment.map(memory => (
                    <div key={memory.id} className="p-4 md:p-5 rounded-[1.5rem] bg-background border hover:border-foreground/30 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-xl border ${typeColors[memory.type]} shrink-0`}>
                            <Target className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{memory.title}</p>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{memory.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(memory)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button onClick={() => handleDelete(memory.id)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group/btn"><Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-red-500 transition-colors" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {groupedMemories.note.length > 0 && (
              <Section count={groupedMemories.note.length} title="Notes" icon={FileText}>
                <div className="space-y-2">
                  {groupedMemories.note.map(memory => (
                    <div key={memory.id} className="p-4 md:p-5 rounded-[1.5rem] bg-background border hover:border-foreground/30 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-xl border ${typeColors[memory.type]} shrink-0`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{memory.title}</p>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{memory.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(memory)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button onClick={() => handleDelete(memory.id)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group/btn"><Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-red-500 transition-colors" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {filteredMemories.length === 0 && (
              <div className="p-16 text-center border border-dashed rounded-[2rem] bg-muted/5">
                <div className="w-16 h-16 rounded-full bg-muted/30 border border-border mx-auto flex items-center justify-center mb-6">
                  <FileText className="h-6 w-6 text-muted-foreground opacity-70" />
                </div>
                <h3 className="text-lg font-serif font-medium mb-2">No memories found</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Start building your startup's memory by adding decisions, commitments, and notes.</p>
                <button 
                  onClick={() => setAddModalOpen(true)}
                  className="rounded-full px-6 h-11 border border-border bg-background hover:bg-muted transition-colors font-medium text-sm inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first memory
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="rounded-[2rem] p-6 pb-8 border-border">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif text-2xl font-medium tracking-tight">
              {editingMemory ? 'Edit Memory' : 'Add New Memory'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {(['decision', 'commitment', 'note', 'context'] as const).map(type => (
                  <button 
                    key={type} 
                    onClick={() => setFormData({ ...formData, type })}
                    className={`px-4 h-9 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                      formData.type === type 
                        ? "bg-foreground text-background" 
                        : "bg-background border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Title</label>
              <input 
                placeholder="Brief title..." 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="w-full h-12 px-5 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors"
               />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Content</label>
              <textarea 
                placeholder="Describe this memory..." 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                className="w-full min-h-[120px] p-5 rounded-[1.5rem] border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors resize-none leading-relaxed" 
               />
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
              disabled={saving || !formData.title.trim() || !formData.content.trim()}
              className="rounded-full px-8 h-11 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium text-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? "Saving..." : editingMemory ? "Update" : "Save Memory"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
