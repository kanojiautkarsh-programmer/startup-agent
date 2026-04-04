'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Users, Mail, Crown, Shield, UserMinus, Copy, Check } from 'lucide-react'

interface Team {
  id: string
  name: string
  slug: string
  role: string
  member_count: number
}

interface Member {
  id: string
  role: string
  joined_at: string
  user: {
    id: string
    email: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
    }
  }
}

export default function TeamSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'members' | 'settings' | 'invites'>('members')

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (currentTeam) {
      fetchMembers(currentTeam.id)
    }
  }, [currentTeam])

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.rpc('get_user_teams', {
        user_uuid: user.id
      })

      if (error) throw error
      setTeams(data || [])
      
      if (data && data.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_team_id')
          .eq('id', user.id)
          .single()
        
        const savedTeam = data.find((t: Team) => t.id === profile?.current_team_id)
        setCurrentTeam(savedTeam || data[0])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:user_id (
            id,
            email,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const createTeam = async () => {
    if (!newTeamName.trim()) return
    
    setCreatingTeam(true)
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName.trim() })
      })

      const { team } = await response.json()
      
      if (team) {
        await fetchTeams()
        setCurrentTeam(team)
        setNewTeamName('')
      }
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setCreatingTeam(false)
    }
  }

  const switchTeam = async (team: Team) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ current_team_id: team.id })
      .eq('id', user.id)

    setCurrentTeam(team)
    router.refresh()
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !currentTeam) return
    
    setSendingInvite(true)
    try {
      const response = await fetch(`/api/teams/${currentTeam.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: inviteEmail.trim(),
          role: inviteRole 
        })
      })

      if (response.ok) {
        setInviteEmail('')
        alert('Invitation sent successfully!')
      } else {
        const { error } = await response.json()
        alert(error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Failed to send invitation')
    } finally {
      setSendingInvite(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!currentTeam) return
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await fetch(`/api/teams/${currentTeam.id}/members?user_id=${memberId}`, {
        method: 'DELETE'
      })
      await fetchMembers(currentTeam.id)
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  const copyInviteLink = () => {
    if (!currentTeam) return
    navigator.clipboard.writeText(`${window.location.origin}/team/invite/${currentTeam.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
      default: return <Users className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-medium tracking-tight">Team Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your team and collaborators</p>
      </div>

      {teams.length === 0 ? (
        <div className="bg-muted/30 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-medium mb-2">No teams yet</h2>
          <p className="text-muted-foreground mb-6">Create a team to start collaborating with others</p>
          <div className="flex gap-3 justify-center">
            <input
              type="text"
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="px-4 py-2 rounded-full border border-border bg-background"
            />
            <button
              onClick={createTeam}
              disabled={creatingTeam || !newTeamName.trim()}
              className="px-6 py-2 rounded-full bg-[#2D211B] text-white disabled:opacity-50"
            >
              {creatingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Team'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Team</label>
              <select
                value={currentTeam?.id || ''}
                onChange={(e) => {
                  const team = teams.find(t => t.id === e.target.value)
                  if (team) switchTeam(team)
                }}
                className="w-full mt-1 px-4 py-2 rounded-lg border border-border bg-background"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.role})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setNewTeamName('')
                setCreatingTeam(true)
              }}
              className="mt-6 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Team
            </button>
          </div>

          {creatingTeam && (
            <div className="bg-muted/30 rounded-2xl p-6">
              <h3 className="font-medium mb-4">Create New Team</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
                />
                <button
                  onClick={createTeam}
                  disabled={creatingTeam || !newTeamName.trim()}
                  className="px-6 py-2 rounded-lg bg-[#2D211B] text-white disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setCreatingTeam(false)}
                  className="px-6 py-2 rounded-lg border border-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {currentTeam && (
            <>
              <div className="border-b border-border">
                <div className="flex gap-8">
                  <button
                    onClick={() => setTab('members')}
                    className={`pb-3 text-sm font-medium ${tab === 'members' ? 'border-b-2 border-foreground -mb-px' : 'text-muted-foreground'}`}
                  >
                    Members ({members.length})
                  </button>
                  <button
                    onClick={() => setTab('invites')}
                    className={`pb-3 text-sm font-medium ${tab === 'invites' ? 'border-b-2 border-foreground -mb-px' : 'text-muted-foreground'}`}
                  >
                    Invites
                  </button>
                  {currentTeam.role === 'owner' && (
                    <button
                      onClick={() => setTab('settings')}
                      className={`pb-3 text-sm font-medium ${tab === 'settings' ? 'border-b-2 border-foreground -mb-px' : 'text-muted-foreground'}`}
                    >
                      Settings
                    </button>
                  )}
                </div>
              </div>

              {tab === 'members' && (
                <div className="space-y-4">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#2D211B] flex items-center justify-center text-white font-medium">
                          {member.user.profiles?.full_name?.[0] || member.user.email?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.user.profiles?.full_name || 'Unnamed'}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </div>
                        {member.role !== 'owner' && currentTeam.role === 'owner' && (
                          <button
                            onClick={() => removeMember(member.user.id)}
                            className="p-2 text-muted-foreground hover:text-red-500"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {currentTeam.role === 'owner' && (
                    <div className="border border-dashed border-border rounded-xl p-6">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Invite Team Member
                      </h3>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          placeholder="Email address"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
                        />
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-border bg-background"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={sendInvite}
                          disabled={sendingInvite || !inviteEmail.trim()}
                          className="px-6 py-2 rounded-lg bg-[#2D211B] text-white disabled:opacity-50 flex items-center gap-2"
                        >
                          {sendingInvite && <Loader2 className="w-4 h-4 animate-spin" />}
                          Send Invite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'invites' && currentTeam.role === 'owner' && (
                <div className="space-y-6">
                  <div className="bg-muted/30 rounded-xl p-6">
                    <h3 className="font-medium mb-4">Share Invite Link</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Anyone with this link can join your team
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/team/invite/${currentTeam.id}`}
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm"
                      />
                      <button
                        onClick={copyInviteLink}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted/50 flex items-center gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'settings' && currentTeam.role === 'owner' && (
                <div className="bg-muted/30 rounded-xl p-6">
                  <h3 className="font-medium mb-4">Team Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Additional team settings coming soon. Team name and avatar customization will be available in a future update.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
