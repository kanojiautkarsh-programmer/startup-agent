"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/command/command-palette"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
]

const providers = [
  {
    id: 'anthropic',
    name: 'Claude',
    provider: 'Anthropic',
    description: 'Best for complex reasoning and long conversations',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    color: 'bg-orange-500/10 text-orange-500',
    keyField: 'anthropic_key_encrypted'
  },
  {
    id: 'openai',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Fast responses and wide model availability',
    docsUrl: 'https://platform.openai.com/api-keys',
    color: 'bg-green-500/10 text-green-500',
    keyField: 'openai_key_encrypted'
  },
  {
    id: 'github',
    name: 'GitHub Models',
    provider: 'GitHub',
    description: 'Free LLM API with GPT-4o, Llama, DeepSeek & more',
    docsUrl: 'https://github.com/marketplace/models',
    color: 'bg-gray-500/10 text-gray-500',
    keyField: 'github_key_encrypted'
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Native multimodal capabilities',
    docsUrl: 'https://makersuite.google.com/app/apikey',
    color: 'bg-blue-500/10 text-blue-500',
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

  const maskKey = (key: string) => {
    if (key.length < 10) return '•'.repeat(key.length)
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="flex-1 pl-60">
          <div className="flex">
            <div className="w-64 border-r bg-card h-[calc(100vh-3.5rem)] sticky top-14 p-4">
              <Skeleton className="h-4 w-16 mb-4 ml-3" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full mb-2" />)}
            </div>
            <div className="flex-1 p-6 max-w-3xl">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64 mb-6" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full mb-4" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex">
          <div className="w-64 border-r bg-card h-[calc(100vh-3.5rem)] sticky top-14 p-4 space-y-1">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-3">Settings</h2>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>

          <div className="flex-1 p-6 max-w-3xl">
            <h1 className="text-2xl font-semibold mb-2">API Keys</h1>
            <p className="text-muted-foreground mb-6">
              Connect your providers. Add your own keys to use the app.
            </p>

            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message.text}
              </div>
            )}

            {providers.map(provider => {
              const hasKey = !!apiKeys[provider.id]
              const isEditing = editingKey === provider.id

              return (
                <Card key={provider.id} className="p-6 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider.color}`}>
                        <Key className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </div>
                    {hasKey && !isEditing && (
                      <Badge variant="success" className="gap-1">
                        <Check className="h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {!hasKey && !isEditing && (
                      <Badge variant="secondary">Not Connected</Badge>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value)}
                          placeholder="Enter API key..."
                          className="font-mono"
                          autoFocus
                        />
                        <Button onClick={() => handleSaveKey(provider.id, provider.keyField)} disabled={saving || !keyInput.trim()}>
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={() => { setEditingKey(null); setKeyInput('') }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : hasKey ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <Input
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          value={apiKeys[provider.id]}
                          disabled
                          className="font-mono"
                        />
                        <Button variant="outline" size="icon" onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}>
                          {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" onClick={() => { setEditingKey(provider.id); setKeyInput(apiKeys[provider.id]); }}>
                          Update
                        </Button>
                        <Button variant="outline" className="text-red-500 hover:text-red-500" onClick={() => handleDeleteKey(provider.id, provider.keyField)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setEditingKey(provider.id)} className="flex-1">
                        Add API Key
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                          Get API Key
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}

            <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">How we protect your keys:</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Encrypted at rest with AES-256</li>
                <li>• Never logged or shared with third parties</li>
                <li>• You can delete keys anytime</li>
                 <li>• We only use keys to facilitate your requests</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
