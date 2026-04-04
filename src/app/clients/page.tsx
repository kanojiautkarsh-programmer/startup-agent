"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Mail,
  Building,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Client {
  id: string
  name: string
  company: string
  status: 'active' | 'onboarding' | 'at_risk' | 'inactive'
  value: number
  email: string
  created_at: string
}

const statusColors = {
  active: "text-green-600 bg-green-500/10 border-green-500/20 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
  onboarding: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  at_risk: "text-destructive bg-destructive/10 border-destructive/20",
  inactive: "text-muted-foreground bg-muted border-border",
}

export default function ClientsPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [clients, setClients] = React.useState<Client[]>([])
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
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email
      })

      // Fetch real conversations as client interactions
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Map conversations to client format
      const realClients: Client[] = (conversations || []).map((conv, index) => ({
        id: conv.id,
        name: conv.title || `Chat ${index + 1}`,
        company: conv.title || 'TaskLyne Chat',
        status: 'active' as const,
        value: 0,
        email: user.email || '',
        created_at: conv.created_at
      }))

      setClients(realClients)
      setLoading(false)
    }

    fetchData()
  }, [router])

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="flex-1 pl-60">
          <div className="p-8 max-w-5xl mx-auto">
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-12 w-full mb-8 rounded-full" />
            <Skeleton className="h-48 w-full mb-4 rounded-3xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} user={user} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-serif text-foreground font-medium tracking-tight mb-2">
                Client <span className="italic font-normal">& Accounts</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">Manage your customer portfolio</p>
            </div>
            <button className="rounded-full px-6 h-12 bg-emphasis text-emphasis-fg hover:bg-emphasis-hover font-medium transition-colors flex items-center justify-center text-sm shadow-sm shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>

          <div className="relative mb-10 group">
            <div className="absolute inset-0 bg-[#2D211B]/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full shadow-inner" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
            <input 
              placeholder="Search clients by name or company..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-14 pl-14 pr-6 rounded-full border border-border/60 bg-card text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 font-medium relative z-10 shadow-sm"
            />
          </div>

          <div className="bg-background border border-border/60 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Client Name</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Company</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Status</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Contract Value</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-muted/50 border flex items-center justify-center font-serif text-sm font-medium shadow-sm">
                            {client.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm tracking-tight">{client.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                              <Mail className="h-3 w-3" /> {client.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <Building className="h-3 w-3 text-muted-foreground" />
                           <span className="text-sm font-medium">{client.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColors[client.status]}`}>
                          {client.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-serif font-medium tabular-nums">
                          ${client.value.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-emphasis hover:text-emphasis-fg transition-all shadow-sm">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button className="w-9 h-9 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-muted transition-all shadow-sm">
                            <MoreVertical className="h-4 w-4 text-foreground/70" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

             {filteredClients.length === 0 && (
              <div className="py-24 text-center border-t border-dashed border-border/60 bg-muted/5 animate-slide-up">
                <div className="w-20 h-20 rounded-[2rem] bg-card border border-border/40 mx-auto flex items-center justify-center mb-10 shadow-xl">
                   <Users className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h3 className="text-3xl font-serif font-medium mb-4 tracking-tight">No clients found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium italic font-serif">Try adjusting your search criteria or register a new customer in your portal.</p>
              </div>
            )}
          </div>


        </div>
      </main>
    </div>
  )
}




