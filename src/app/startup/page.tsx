'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { CommandPalette } from '@/components/command/command-palette'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Clock,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Handshake,
  Calendar,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

interface StartupProfile {
  company_name: string
  stage: string
  industry: string
}

interface Metric {
  mrr: number
  active_users: number
  burn_rate: number
  runway_months: number
}

interface Commitment {
  id: string
  title: string
  committed_to: string
  deadline: string
  status: string
  priority: string
}

interface JournalEntry {
  id: string
  title: string
  entry_date: string
  mood: string
}

export default function StartupPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StartupProfile | null>(null)
  const [latestMetrics, setLatestMetrics] = useState<Metric | null>(null)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const [profileRes, metricsRes, commitmentsRes, journalRes] = await Promise.all([
        supabase.from('startup_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('startup_metrics').select('*').eq('user_id', user.id).order('metric_date', { ascending: false }).limit(1).single(),
        supabase.from('commitments').select('*').eq('user_id', user.id).in('status', ['pending', 'in-progress']).order('deadline').limit(5),
        supabase.from('founder_journal').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(3)
      ])

      setProfile(profileRes.data)
      setLatestMetrics(metricsRes.data)
      setCommitments(commitmentsRes.data || [])
      setJournalEntries(journalRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [router])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num}`
  }

  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      great: '🚀',
      good: '😊',
      okay: '😐',
      challenging: '😤',
      difficult: '😔'
    }
    return moods[mood] || '📝'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Sidebar collapsed={false} onToggle={() => {}} user={{}} />
        <main className="pl-60">
          <div className="p-10">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={{}} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-60'}`}>
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-serif font-medium tracking-tight mb-2">
              {getGreeting()}, Founder
            </h1>
            {profile?.company_name ? (
              <p className="text-muted-foreground">
                Welcome back to <span className="font-semibold">{profile.company_name}</span>
              </p>
            ) : (
              <p className="text-muted-foreground">
                <Link href="/settings/startup" className="text-blue-600 hover:underline">Set up your startup profile</Link> to get personalized insights
              </p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-[#2D211B] rounded-3xl p-6 text-white">
              <div className="flex items-center justify-between mb-4 opacity-70">
                <span className="text-[10px] font-bold uppercase tracking-widest">MRR</span>
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="text-3xl font-serif font-medium">{formatCurrency(latestMetrics?.mrr || 0)}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60">Monthly Revenue</p>
            </div>

            <div className="bg-background border border-border/60 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest">Users</span>
                <Users className="h-4 w-4" />
              </div>
              <p className="text-3xl font-serif font-medium">{latestMetrics?.active_users || 0}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-1 text-muted-foreground">Active Users</p>
            </div>

            <div className="bg-background border border-border/60 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest">Burn Rate</span>
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-3xl font-serif font-medium">{formatCurrency(latestMetrics?.burn_rate || 0)}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-1 text-muted-foreground">Per Month</p>
            </div>

            <div className="bg-background border border-border/60 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest">Runway</span>
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-3xl font-serif font-medium">{latestMetrics?.runway_months || 0}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-1 text-muted-foreground">Months Left</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Pending Commitments */}
            <div className="bg-background border rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pending Commitments
                </h2>
                <Link href="/startup/commitments" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              
              {commitments.length > 0 ? (
                <div className="space-y-4">
                  {commitments.map(commitment => (
                    <div key={commitment.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        commitment.priority === 'critical' ? 'bg-red-100 text-red-600' :
                        commitment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                        'bg-muted'
                      }`}>
                        {commitment.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{commitment.title}</p>
                        <p className="text-sm text-muted-foreground">To: {commitment.committed_to}</p>
                        {commitment.deadline && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(commitment.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending commitments</p>
                  <Link href="/startup/commitments" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                    Add your first commitment
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Journal */}
            <div className="bg-background border rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Founder Journal
                </h2>
                <Link href="/startup/journal" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              
              {journalEntries.length > 0 ? (
                <div className="space-y-4">
                  {journalEntries.map(entry => (
                    <div key={entry.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{entry.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No journal entries yet</p>
                  <Link href="/startup/journal" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                    Write your first entry
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/startup/profile" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
              <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Edit3 className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm">Edit Startup</p>
            </Link>
            <Link href="/startup/metrics" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
              <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm">Log Metrics</p>
            </Link>
            <Link href="/startup/journal" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
              <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm">New Journal</p>
            </Link>
            <Link href="/startup/commitments" className="rounded-3xl border bg-muted/10 p-6 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-center group">
              <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm">Add Commitment</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
