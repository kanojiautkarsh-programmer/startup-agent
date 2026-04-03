import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
    }

    const { data: members } = await supabase
      .from('team_members')
      .select('*, profiles(full_name, avatar_url, email)')
      .eq('team_id', id)

    return NextResponse.json({ 
      team,
      role: membership.role,
      members: members || []
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
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
    const { name, avatar_url } = body

    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only team owner can update settings' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    if (name) updates.name = name.trim()
    if (avatar_url !== undefined) updates.avatar_url = avatar_url

    const { data: updatedTeam, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
    }

    return NextResponse.json({ team: updatedTeam })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: 'Only team owner can delete team' }, { status: 403 })
    }

    await supabase.from('teams').delete().eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
