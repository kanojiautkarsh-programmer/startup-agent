"use client"

export const dynamic = 'force-dynamic'

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
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Target,
  Lightbulb,
  Plus,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
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
  decision: "bg-muted text-foreground/80",
  commitment: "bg-muted text-foreground/80",
  context: "bg-muted text-foreground/80",
  note: "bg-muted text-foreground/80",
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Card className="p-4 shadow-none rounded-xl">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left focus:outline-none">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <h3 className="font-semibold tracking-tight">{title}</h3>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </Card>
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
              <h1 className="text-2xl font-semibold tracking-tight">Memory & Context</h1>
              <p className="text-sm font-medium text-muted-foreground">Your startup&apos;s history, always accessible</p>
            </div>
            <Button onClick={() => { setEditingMemory(null); setFormData({ type: 'decision', title: '', content: '' }); setAddModalOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Memory
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search memory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {['all', 'decision', 'commitment', 'note', 'context'].map(type => (
                <Button key={type} variant={filterType === type ? "default" : "outline"} size="sm" onClick={() => setFilterType(type)}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {groupedMemories.decision.length > 0 && (
              <Section title={`DECISIONS (${groupedMemories.decision.length})`} icon={FileText}>
                <div className="space-y-3">
                  {groupedMemories.decision.map(memory => {
                    const Icon = typeIcons[memory.type]
                    return (
                      <div key={memory.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${typeColors[memory.type]}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{memory.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{memory.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(memory)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(memory.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {groupedMemories.commitment.length > 0 && (
              <Section title={`COMMITMENTS (${groupedMemories.commitment.length})`} icon={Target}>
                <div className="space-y-3">
                  {groupedMemories.commitment.map(memory => (
                    <div key={memory.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeColors[memory.type]}`}>
                            <Target className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{memory.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{memory.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(memory)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(memory.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {groupedMemories.note.length > 0 && (
              <Section title={`NOTES (${groupedMemories.note.length})`} icon={FileText}>
                <div className="space-y-3">
                  {groupedMemories.note.map(memory => (
                    <div key={memory.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeColors[memory.type]}`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{memory.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{memory.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(memory)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(memory.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {filteredMemories.length === 0 && (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No memories yet</h3>
                <p className="text-muted-foreground mb-4">Start building your startup&apos;s memory by adding decisions, commitments, and notes.</p>
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first memory
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMemory ? 'Edit Memory' : 'Add New Memory'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <div className="flex gap-2">
                {(['decision', 'commitment', 'note', 'context'] as const).map(type => (
                  <Button key={type} variant={formData.type === type ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, type })}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input placeholder="Brief title..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea placeholder="Describe this memory..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.title.trim() || !formData.content.trim()}>
              {saving ? "Saving..." : editingMemory ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
