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
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
]

const providers = [
  {
    id: 'anthropic',
    name: 'Claude',
    provider: 'Anthropic',
    description: 'Best for complex reasoning and long conversations',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    keyField: 'anthropic_key_encrypted'
  },
  {
    id: 'openai',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Fast responses and wide model availability',
    docsUrl: 'https://platform.openai.com/api-keys',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    keyField: 'openai_key_encrypted'
  },
  {
    id: 'github',
    name: 'GitHub Models',
    provider: 'GitHub',
    description: 'Free LLM API with GPT-4o, Llama, DeepSeek & more',
    docsUrl: 'https://github.com/marketplace/models',
    color: 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20',
    keyField: 'github_key_encrypted'
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Native multimodal capabilities',
    docsUrl: 'https://makersuite.google.com/app/apikey',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
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
      setMessage({ type: 'error', text: 'Failed to save API key' })
    } else {
      setApiKeys(prev => ({ ...prev, [providerId]: keyInput.trim() }))
      setMessage({ type: 'success', text: `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} API key saved` })
      setEditingKey(null)
      setKeyInput('')
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
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
    setMessage({ type: 'success', text: 'API key removed' })
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex font-sans">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="flex-1 pl-60">
          <div className="flex">
            <div className="w-64 border-r border-border/50 bg-background/50 h-[calc(100vh-3.5rem)] sticky top-14 p-6">
              <Skeleton className="h-4 w-16 mb-6" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full mb-2 rounded-full" />)}
            </div>
            <div className="flex-1 p-8 md:p-12 max-w-4xl">
              <Skeleton className="h-10 w-48 mb-8" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full mb-6 rounded-[2rem]" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          {/* Settings Navigation */}
          <div className="w-64 border-r border-border/50 bg-background/50 h-[calc(100vh-3.5rem)] sticky top-14 p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 px-4">Settings</h2>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-4 rounded-full px-4 py-3 text-sm transition-all font-medium ${
                      isActive 
                        ? "bg-foreground text-background shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 max-w-4xl">
            <div className="mb-10">
              <h1 className="text-4xl font-serif text-foreground font-medium tracking-tight mb-2">
                API <span className="italic font-normal">Keys</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">Connect your providers. Add your own keys securely.</p>
            </div>

            {message && (
              <div className={`mb-8 p-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium border shadow-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              {providers.map(provider => {
                const hasKey = !!apiKeys[provider.id]
                const isEditing = editingKey === provider.id

                return (
                  <div key={provider.id} className="bg-background border border-border/60 rounded-[2rem] p-6 md:p-8 hover:border-foreground/20 transition-colors shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${provider.color}`}>
                          <Key className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold tracking-tight text-lg">{provider.name}</h3>
                          <p className="text-xs text-muted-foreground font-medium">{provider.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex shrink-0">
                        {hasKey && !isEditing && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest text-green-600">
                            <Check className="h-3 w-3" />
                            Connected
                          </span>
                        )}
                        {!hasKey && !isEditing && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Not Connected
                          </span>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4 pt-4 border-t border-border/40">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Enter Secret Key</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="password"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="sk-..."
                            className="flex-1 h-11 px-5 rounded-full border border-border bg-background text-sm font-mono focus:outline-none focus:border-foreground/50 transition-colors"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingKey(null); setKeyInput('') }}
                              className="rounded-full px-6 h-11 border border-border hover:bg-muted font-medium text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSaveKey(provider.id, provider.keyField)} 
                              disabled={saving || !keyInput.trim()}
                              className="rounded-full px-6 h-11 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium text-sm transition-colors disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : hasKey ? (
                      <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 flex gap-2">
                           <input
                             type={showKeys[provider.id] ? 'text' : 'password'}
                             value={apiKeys[provider.id]}
                             disabled
                             className="flex-1 h-11 px-5 rounded-full border border-transparent bg-muted/30 text-sm font-mono text-muted-foreground transition-colors cursor-text"
                           />
                           <button 
                             onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                             className="w-11 h-11 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
                             title={showKeys[provider.id] ? "Hide key" : "Reveal key"}
                           >
                             {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => { setEditingKey(provider.id); setKeyInput(apiKeys[provider.id]); }}
                            className="rounded-full px-5 h-11 border border-border hover:bg-muted font-medium text-xs uppercase tracking-wider transition-colors"
                          >
                            Update
                          </button>
                          <button 
                            onClick={() => handleDeleteKey(provider.id, provider.keyField)}
                            className="w-11 h-11 rounded-full border border-border bg-background flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group/btn"
                            title="Remove Key"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => setEditingKey(provider.id)} 
                          className="flex-1 rounded-full px-6 h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-colors text-center"
                        >
                          Add Key
                        </button>
                        <a 
                          href={provider.docsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 rounded-full px-6 h-11 border border-border bg-background hover:bg-muted font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          Get API Key
                          <ExternalLink className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-12 p-8 rounded-[2rem] bg-muted/10 border border-border/40 inline-flex flex-col xl:flex-row gap-8 items-start xl:items-center">
              <div className="w-12 h-12 rounded-full bg-muted/30 border border-border/60 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="">
                <h4 className="font-semibold tracking-tight text-lg mb-4">How we strictly protect your keys</h4>
                <ul className="text-sm text-muted-foreground space-y-2.5 font-medium flex flex-col">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /> Encrypted at rest with AES-256 standard</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /> Never logged or shared with third parties under any condition</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /> Complete deletion control of keys anytime from your end</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /> Key uses are strictly isolated to facilitate your app requests only</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
