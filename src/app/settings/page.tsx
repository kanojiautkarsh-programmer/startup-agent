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
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Key,
  CreditCard,
  Users,
  Shield,
  Bell,
  Palette,
  FileText,
  MessageCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
]

export default function SettingsPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ full_name?: string; email?: string; company?: string } | null>(null)
  const [profile, setProfile] = React.useState<{ full_name?: string; company?: string } | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({ full_name: '', company: '' })
  const supabase = createClient()

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email,
        company: profile?.company
      })
      setProfile(profile)
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        company: profile?.company || ''
      })
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.auth.updateUser({
      data: { full_name: formData.full_name }
    })

    await supabase
      .from('profiles')
      .update({ 
        full_name: formData.full_name,
        company: formData.company
      })
      .eq('id', user.id)

    setSaving(false)
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={false} onToggle={() => {}} user={null} />
        <main className="pl-60">
          <div className="flex">
            <div className="w-64 border-r bg-card h-[calc(100vh-3.5rem)] sticky top-14 p-4">
              <Skeleton className="h-4 w-16 mb-4 ml-3" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full mb-2" />)}
            </div>
            <div className="flex-1 p-8 max-w-3xl">
              <Skeleton className="h-8 w-32 mb-6" />
              <Skeleton className="h-48 w-full mb-4 rounded-xl" />
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
          <div className="w-64 border-r bg-card/50 h-[calc(100vh-3.5rem)] sticky top-14 p-4 space-y-1">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-3">Settings</h2>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-violet-500/10 text-violet-600" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>

          <div className="flex-1 p-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground mb-8">Manage your personal information</p>

            <Card className="overflow-hidden mb-6">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardContent className="p-6">
                <div className="flex items-center gap-5 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{user?.full_name || 'User'}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Your name" className="rounded-lg" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input value={user?.email || ''} disabled className="rounded-lg opacity-60" />
                    <p className="text-xs text-muted-foreground mt-1.5">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Startup Name</label>
                    <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Your startup name" className="rounded-lg" />
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">Starter</span>
                      Current Plan
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Free tier • Configure your AI in API Keys
                    </p>
                  </div>
                  <Button variant="outline" asChild className="rounded-lg">
                    <Link href="/pricing">View Plans</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
