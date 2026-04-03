'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Key,
  CreditCard,
  Shield,
  ArrowRight,
  BookOpen,
  Plug,
  Upload,
  FileText,
  Trash2,
  Check,
  ChevronRight,
  Zap,
  Plus,
  FileCheck,
  Loader2,
  AlertCircle,
  Rocket,
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { cn } from "@/lib/utils"

interface Document {
  id: string
  title: string
  source_type: string
  source_url?: string
  file_name?: string
  file_type?: string
  is_indexed: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "Startup Profile", href: "/settings/startup", icon: Rocket },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Integrations", href: "/settings/integrations", icon: Plug },
  { title: "Knowledge Base", href: "/settings/documents", icon: BookOpen },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
]

export default function DocumentsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null
  })
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const supabase = createClient()

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email
      })

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleIngest = async () => {
    if (!title.trim() || !content.trim()) {
      setUploadState(prev => ({ ...prev, error: 'Identity and Context are required for ingestion.' }))
      return
    }

    setUploadState({ uploading: true, progress: 0, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication Failure')

      setUploadState(prev => ({ ...prev, progress: 20 }))

      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          source_type: 'text',
          user_id: user.id
        })
      })

      setUploadState(prev => ({ ...prev, progress: 80 }))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Protocol Ingestion Failure')
      }

      setUploadState(prev => ({ ...prev, progress: 100 }))
      
      setTimeout(() => {
        setUploadState({ uploading: false, progress: 0, error: null })
        setTitle('')
        setContent('')
        fetchDocuments()
      }, 800)
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error instanceof Error ? error.message : 'Ingestion Failure' 
      }))
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)

      if (error) throw error
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (error) {
      console.error('Error terminating document:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setUploadState(prev => ({ ...prev, error: 'Context Payload exceeds 10MB limit.' }))
      return
    }

    setUploadState({ uploading: true, progress: 0, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication Failure')

      const text = await file.text()
      setUploadState(prev => ({ ...prev, progress: 30 }))

      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: text,
          source_type: 'file',
          metadata: { file_name: file.name, file_type: file.type },
          user_id: user.id
        })
      })

      setUploadState(prev => ({ ...prev, progress: 80 }))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Protocol Ingestion Failure')
      }

      setUploadState(prev => ({ ...prev, progress: 100 }))

      setTimeout(() => {
        setUploadState({ uploading: false, progress: 0, error: null })
        fetchDocuments()
      }, 800)
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error instanceof Error ? error.message : 'Ingestion Failure' 
      }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className={`pl-64 pt-14`}>
          <div className="flex">
            <div className="w-72 border-r border-border/40 h-[calc(100vh-3.5rem)] sticky top-14 p-8">
              <Skeleton className="h-4 w-24 mb-10" />
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full mb-3 rounded-full" />)}
            </div>
            <div className="flex-1 p-12 max-w-4xl">
              <Skeleton className="h-14 w-64 mb-12 rounded-full" />
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-[3rem]" />
                <Skeleton className="h-96 w-full rounded-[3rem]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          {/* Settings Navigation */}
          <div className="w-72 border-r border-border/40 bg-muted/5 h-[calc(100vh-3.5rem)] sticky top-14 p-8 hidden lg:block animate-slide-in-left">
            <div className="flex items-center gap-3 mb-10 px-4">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">Command Center</h2>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={cn(
                      "flex items-center justify-between group rounded-2xl px-5 h-12 text-sm transition-all font-medium border",
                      isActive 
                        ? "bg-[#2D211B] text-white border-transparent shadow-xl translate-x-2" 
                        : "text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground hover:border-border/40"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground/60")} />
                      <span className={cn(isActive && "font-bold tracking-tight")}>{item.title}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </Link>
                )
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-border/40 px-4">
               <div className="glass-card rounded-2xl p-6 bg-primary/5 border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                     <Zap className="h-4 w-4 text-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pro Status</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Indexing limits increased to 5,000 documents for Pro operators.</p>
                  <Link href="/pricing" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center group">
                     Scale Core <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-16 max-w-5xl">
            <div className="mb-16 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-serif text-foreground font-medium tracking-tight mb-4">
                Knowledge <span className="italic font-normal text-muted-foreground/60">& Base</span>
              </h1>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Long-term context ingestion pending</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
               {/* Manual Ingestion */}
               <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-border shadow-lg flex items-center justify-center text-[#2D211B]">
                        <FileText className="h-6 w-6" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-serif font-medium tracking-tight">Manual Ingest</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Direct protocol entry</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-2">Context Identifier</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Document title or identifier"
                        className="w-full h-14 px-8 rounded-full border border-border/60 bg-background dark:bg-card text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-2">System Context Payload</label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste context for vector alignment..."
                        rows={6}
                        className="w-full p-8 rounded-[2rem] border border-border/60 bg-white text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none"
                      />
                    </div>

                    <button
                      onClick={handleIngest}
                      disabled={uploadState.uploading || !title.trim() || !content.trim()}
                      className="w-full h-14 rounded-full bg-[#2D211B] text-white hover:bg-primary font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {uploadState.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {uploadState.uploading ? 'Processing...' : 'Engage Ingestion'}
                    </button>
                  </div>
               </div>

               {/* File Ingestion */}
               <div className="flex flex-col gap-8">
                  <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-border shadow-lg flex items-center justify-center text-[#2D211B]">
                          <Upload className="h-6 w-6" />
                      </div>
                      <div>
                          <h2 className="text-2xl font-serif font-medium tracking-tight">Upload Protocol</h2>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Encrypted batch upload</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground/60 font-medium mb-8">Supported: <span className="text-foreground">TXT, MD, PDF, JSON</span>. Max context payload: 10MB.</p>
                    
                    <div className="relative group">
                      <input
                        type="file"
                        accept=".txt,.md,.json,.csv,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploadState.uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-40 border-2 border-dashed border-border/60 rounded-[2rem] flex flex-col items-center justify-center gap-4 group-hover:border-primary/40 transition-all group-hover:bg-primary/[0.02]">
                         <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                            <Upload className="h-6 w-6" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Drop file or click to select</p>
                      </div>
                    </div>

                    {uploadState.uploading && (
                      <div className="mt-8 space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                           <span>Ingestion Progress</span>
                           <span>{uploadState.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-500 ease-out"
                            style={{ width: `${uploadState.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadState.error && (
                      <div className="mt-6 flex items-center gap-3 text-destructive p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                         <AlertCircle className="h-4 w-4" />
                         <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{uploadState.error}</p>
                      </div>
                    )}
                  </div>

                  <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl flex-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-center gap-6 mb-4">
                         <Shield className="h-6 w-6 text-primary" />
                         <h3 className="text-xl font-serif font-medium tracking-tight">Security Isolation</h3>
                      </div>
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">All context point documents are encrypted and hashed before being routed to dedicated vector clusters. Deletion triggers an instant purge protocol.</p>
                  </div>
               </div>
            </div>

            <div className="glass-card border border-border/40 rounded-[3rem] overflow-hidden shadow-2xl animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <div className="px-10 py-8 border-b border-border/40 flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-4 bg-primary rounded-full" />
                   <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground">Established Index ({documents.length})</h2>
                </div>
              </div>

              <div className="divide-y divide-border/40">
                {documents.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground/20">
                       <FileText className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-xl font-serif font-medium text-muted-foreground/60">No context establishing points found.</p>
                       <p className="text-xs text-muted-foreground/40 font-medium tracking-wide">Sync your Notion workspace or upload manual context to begin.</p>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {documents.map((doc, idx) => (
                      <li key={doc.id} className="px-10 py-6 flex items-center justify-between hover:bg-muted/5 transition-all group">
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            doc.is_indexed ? "bg-primary/5 text-primary border border-primary/10" : "bg-muted/30 text-muted-foreground/40 border border-border/40"
                          )}>
                             {doc.is_indexed ? <FileCheck className="h-6 w-6" /> : <Loader2 className="h-6 w-6 animate-spin" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-foreground truncate tracking-tight mb-1">{doc.title}</h4>
                            <div className="flex items-center gap-3">
                               <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2 py-0.5 rounded-full bg-muted border border-border/40">
                                  {doc.source_type}
                               </span>
                               <span className="w-1 h-1 bg-border rounded-full" />
                               <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-bold">
                                 {new Date(doc.created_at).toLocaleDateString()}
                               </p>
                               {doc.is_indexed && (
                                 <>
                                   <span className="w-1 h-1 bg-border rounded-full" />
                                   <div className="flex items-center gap-1.5 text-green-600/60">
                                      <div className="w-1 h-1 rounded-full bg-green-500" />
                                      <span className="text-[9px] font-bold uppercase tracking-widest">Active Index</span>
                                   </div>
                                 </>
                               )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="w-12 h-12 rounded-full border border-border/60 bg-white flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-transparent transition-all shadow-sm group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



