import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only team owner can view invites' }, { status: 403 })
    }

    const { data: invites, error } = await supabase
      .from('team_invites')
      .select('*')
      .eq('team_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invites:', error)
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
    }

    return NextResponse.json({ invites: invites || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email, role = 'member' } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { data: team } = await supabase
      .from('teams')
      .select('id, name, owner_id')
      .eq('id', id)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only team owner can invite members' }, { status: 403 })
    }

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', id)
        .eq('user_id', existingUser.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
      }
    }

    const { data: existingInvite } = await supabase
      .from('team_invites')
      .select('id')
      .eq('team_id', id)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: 'An invite already exists for this email' }, { status: 400 })
    }

    const token = await supabase.rpc('generate_invite_token')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: invite, error } = await supabase
      .from('team_invites')
      .insert({
        team_id: id,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invite:', error)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/team/invite/${token}`

    await sendEmail({
      to: email,
      subject: `You've been invited to join ${team.name} on TaskLyne`,
      html: `
        <h2>You've been invited to join ${team.name}</h2>
        <p>You've been invited to join the team "${team.name}" on TaskLyne as a ${role}.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2D211B; color: white; text-decoration: none; border-radius: 8px;">Accept Invitation</a>
        <p style="margin-top: 20px; color: #666;">This invitation expires in 7 days.</p>
      `
    })

    return NextResponse.json({ invite }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
