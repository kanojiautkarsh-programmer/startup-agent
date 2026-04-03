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
  active: "text-green-600 bg-green-500/10 border-green-500/20",
  onboarding: "text-blue-600 bg-blue-500/10 border-blue-500/20",
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
  const supabase = createClient()

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Mocking clients data for now as we haven't established the table schema yet
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          company: 'Acme Corp',
          status: 'active',
          value: 12000,
          email: 'sarah@acme.com',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Marcus Johnson',
          company: 'GrowthLabs',
          status: 'onboarding',
          value: 5000,
          email: 'marcus@growthlabs.io',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Elena Rodriguez',
          company: 'Solaris Systems',
          status: 'at_risk',
          value: 25000,
          email: 'elena@solaris.com',
          created_at: new Date().toISOString()
        }
      ]

      setClients(mockClients)
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
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={null} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
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
            <button className="rounded-full px-6 h-12 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-colors flex items-center justify-center text-sm shadow-sm shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>

          <div className="relative mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search clients by name or company..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-12 pl-11 pr-4 rounded-full border border-border/60 bg-muted/10 text-sm focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="bg-background border border-border/60 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/10">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contract Value</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted/50 border flex items-center justify-center font-serif text-sm font-medium">
                            {client.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm tracking-tight">{client.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-2.5 w-2.5" /> {client.email}
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
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClients.length === 0 && (
              <div className="p-20 text-center">
                 <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                 <h3 className="font-serif text-xl font-medium mb-2">No clients found</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto">Try adjusting your search or add a new client to your portfolio.</p>
              </div>
            )}
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
             <div className="p-8 rounded-[2rem] bg-[#2D211B] text-white shadow-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-4">Total Portfolio Value</p>
                <h2 className="text-4xl font-serif font-medium tracking-tight">$42,000</h2>
                <p className="text-xs mt-4 flex items-center gap-2">
                   <span className="text-green-400 font-bold">↑ 12%</span> vs last month
                </p>
             </div>
             
             <div className="p-8 rounded-[2rem] bg-background border border-border/60 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">New Leads (Q3)</p>
                <h2 className="text-4xl font-serif font-medium tracking-tight">14</h2>
                <p className="text-xs mt-4 font-medium text-muted-foreground">
                   6 scheduled for next week
                </p>
             </div>

             <div className="p-8 rounded-[2rem] bg-background border border-border/60 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Churn Risk</p>
                <h2 className="text-4xl font-serif font-medium tracking-tight">1</h2>
                <p className="text-xs mt-4 font-medium text-destructive">
                   Account: Solaris Systems
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
