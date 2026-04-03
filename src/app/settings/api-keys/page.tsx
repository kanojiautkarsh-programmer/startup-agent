"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
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
  Check,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  AlertCircle,
  BookOpen,
  Plug,
  ChevronRight,
  Zap,
  Rocket,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "Startup Profile", href: "/settings/startup", icon: Rocket },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Integrations", href: "/settings/integrations", icon: Plug },
  { title: "Knowledge Base", href: "/settings/documents", icon: BookOpen },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
]

const providers = [
  {
    id: 'anthropic',
    name: 'Claude Intelligence',
    provider: 'Anthropic',
    description: 'Specialized for complex reasoning and high-context persistence.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    color: 'bg-orange-500/5 text-orange-600 border-orange-200/50',
    keyField: 'anthropic_key_encrypted'
  },
  {
    id: 'openai',
    name: 'GPT-4 Global',
    provider: 'OpenAI',
    description: 'General purpose intelligence providing rapid response latency.',
    docsUrl: 'https://platform.openai.com/api-keys',
    color: 'bg-green-500/5 text-green-600 border-green-200/50',
    keyField: 'openai_key_encrypted'
  },
  {
    id: 'github',
    name: 'GitHub Models',
    provider: 'GitHub',
    description: 'Access to Llama, DeepSeek, and specialized compute clusters.',
    docsUrl: 'https://github.com/marketplace/models',
    color: 'bg-zinc-500/5 text-zinc-600 border-zinc-200/50',
    keyField: 'github_key_encrypted'
  },
  {
    id: 'gemini',
    name: 'Gemini Pro Multi',
    provider: 'Google',
    description: 'Native multimodal processing for distributed intelligence.',
    docsUrl: 'https://makersuite.google.com/app/apikey',
    color: 'bg-blue-500/5 text-blue-600 border-blue-200/50',
    keyField: 'gemini_key_encrypted'
  }
]

export default function APIKeysPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ full_name?: string; email?: string } | null>(null)
  const [apiKeys, setApiKeys] = React.useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({})
  const [editingKey, setEditingKey] = React.useState<string | null>(null)
  const [keyInput, setKeyInput] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('anthropic_key_encrypted, openai_key_encrypted, gemini_key_encrypted, github_key_encrypted')
        .eq('id', user.id)
        .single()

      if (profile) {
        const keys: Record<string, string> = {}
        if (profile.anthropic_key_encrypted) keys.anthropic = profile.anthropic_key_encrypted
        if (profile.openai_key_encrypted) keys.openai = profile.openai_key_encrypted
        if (profile.gemini_key_encrypted) keys.gemini = profile.gemini_key_encrypted
        if (profile.github_key_encrypted) keys.github = profile.github_key_encrypted
        setApiKeys(keys)
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleSaveKey = async (providerId: string, keyField: string) => {
    if (!keyInput.trim()) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ [keyField]: keyInput.trim() })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to deploy protocol key' })
    } else {
      setApiKeys(prev => ({ ...prev, [providerId]: keyInput.trim() }))
      setMessage({ type: 'success', text: `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} key integrated successfully` })
      setEditingKey(null)
      setKeyInput('')
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 4000)
  }

  const handleDeleteKey = async (providerId: string, keyField: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ [keyField]: null })
      .eq('id', user.id)

    setApiKeys(prev => {
      const newKeys = { ...prev }
      delete newKeys[providerId]
      return newKeys
    })
    setMessage({ type: 'success', text: 'Protocol key terminated' })
    setTimeout(() => setMessage(null), 4000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className={`pl-64 pt-14`}>
          <div className="flex">
            <div className="w-72 border-r border-border/40 h-[calc(100vh-3.5rem)] sticky top-14 p-8">
              <Skeleton className="h-4 w-24 mb-10" />
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full mb-3 rounded-full" />)}
            </div>
            <div className="flex-1 p-12 max-w-4xl">
              <Skeleton className="h-14 w-64 mb-12 rounded-full" />
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[3rem]" />)}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
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
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Integrate your custom LLM clusters for enterprise scale.</p>
                  <Link href="/pricing" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center group">
                     Scale Core <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-16 max-w-5xl">
            <div className="mb-16 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-serif text-foreground font-medium tracking-tight mb-4">
                Provider <span className="italic font-normal text-muted-foreground/60">& Keys</span>
              </h1>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Distributed intelligence routing active</p>
              </div>
            </div>

            {message && (
              <div className={cn(
                "mb-10 p-6 rounded-3xl flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest border shadow-2xl animate-slide-up",
                message.type === 'success' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 'bg-destructive/5 text-destructive border-destructive/20'
              )}>
                {message.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                {message.text}
              </div>
            )}

            <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {providers.map((provider, providerIdx) => {
                const hasKey = !!apiKeys[provider.id]
                const isEditing = editingKey === provider.id

                return (
                  <div key={provider.id} className="glass-card border border-border/40 rounded-[3rem] p-8 md:p-10 hover:border-primary/20 hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                      <div className="flex items-center gap-8">
                        <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shadow-xl transition-all duration-500 group-hover:scale-110", provider.color)}>
                          <Key className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-serif text-3xl font-medium tracking-tight mb-2">{provider.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{provider.provider} Engine</span>
                            <span className="w-1 h-1 bg-border rounded-full" />
                            <p className="text-xs text-muted-foreground font-medium">{provider.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex shrink-0">
                        {hasKey && !isEditing && (
                          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-green-500/5 border border-green-500/20 shadow-inner">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Established</span>
                          </div>
                        )}
                        {!hasKey && !isEditing && (
                          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-muted border border-border/60 shadow-inner">
                             <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Disconnected</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="pt-10 border-t border-border/40 animate-slide-up">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 block mb-4 px-2">Integrate Protocol Key</label>
                        <div className="flex flex-col lg:flex-row gap-4">
                          <input
                            type="password"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="sk-protocol-..."
                            className="flex-1 h-14 px-8 rounded-full border border-border/60 bg-white text-sm font-mono focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                            autoFocus
                          />
                          <div className="flex gap-3">
                            <button 
                              onClick={() => { setEditingKey(null); setKeyInput('') }}
                              className="rounded-full px-10 h-14 border border-border/60 hover:bg-muted font-bold text-[10px] uppercase tracking-widest transition-all"
                            >
                              Abort
                            </button>
                            <button 
                              onClick={() => handleSaveKey(provider.id, provider.keyField)} 
                              disabled={saving || !keyInput.trim()}
                              className="rounded-full px-10 h-14 bg-[#2D211B] text-white hover:bg-primary font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl disabled:opacity-50"
                            >
                              {saving ? 'Integrating...' : 'Integrate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : hasKey ? (
                      <div className="pt-10 border-t border-border/40 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1 flex gap-3">
                           <div className="relative flex-1">
                                <input
                                  type={showKeys[provider.id] ? 'text' : 'password'}
                                  value={apiKeys[provider.id]}
                                  disabled
                                  className="w-full h-14 px-8 rounded-full border border-transparent bg-muted/20 text-sm font-mono text-muted-foreground/60 shadow-inner"
                                />
                                <Shield className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/10" />
                           </div>
                           <button 
                             onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                             className="w-14 h-14 rounded-full border border-border/60 bg-white flex items-center justify-center hover:bg-[#2D211B] hover:text-white transition-all shadow-sm text-muted-foreground shrink-0"
                             title={showKeys[provider.id] ? "Hide key" : "Reveal key"}
                           >
                             {showKeys[provider.id] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                           </button>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button 
                            onClick={() => { setEditingKey(provider.id); setKeyInput(apiKeys[provider.id]); }}
                            className="rounded-full px-8 h-14 border border-border/60 bg-white hover:bg-[#2D211B] hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
                          >
                            Update Provider
                          </button>
                          <button 
                            onClick={() => handleDeleteKey(provider.id, provider.keyField)}
                            className="w-14 h-14 rounded-full border border-border/60 bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn"
                            title="Remove Key"
                          >
                            <Trash2 className="h-5 w-5 text-muted-foreground/60 group-hover/btn:text-white transition-colors" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-10 border-t border-border/40 flex flex-col md:flex-row gap-4">
                        <button 
                          onClick={() => setEditingKey(provider.id)} 
                          className="flex-1 rounded-full h-14 bg-[#2D211B] text-white hover:bg-primary font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group"
                        >
                          Establish Handshake
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a 
                          href={provider.docsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 rounded-full h-14 border border-border/60 bg-white hover:bg-muted font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                        >
                          Provider Documentation
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-20 p-10 md:p-12 rounded-[3.5rem] bg-[#2D211B]/[0.02] border border-border/40 flex flex-col lg:flex-row gap-10 items-start lg:items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-border shadow-xl flex items-center justify-center shrink-0">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-3xl font-medium tracking-tight mb-6">Encrypted Security Layers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground/80">
                     <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-green-600" /></div>
                     <span>AES-256 Protocol Persistence</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground/80">
                     <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-green-600" /></div>
                     <span>Zero-Log Environment Integrity</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground/80">
                     <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-green-600" /></div>
                     <span>Instant Data Termination Protocols</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground/80">
                     <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-green-600" /></div>
                     <span>Isolated Request Sandbox routing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
