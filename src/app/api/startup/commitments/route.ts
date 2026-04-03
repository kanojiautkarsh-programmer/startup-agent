import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('commitments')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ commitments: data || [] });
  } catch (error) {
    console.error('Commitments fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch commitments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, committed_to, deadline, priority } = body;

    const { data, error } = await supabase
      .from('commitments')
      .insert({
        user_id: user.id,
        title,
        description,
        committed_to,
        deadline,
        priority: priority || 'medium'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ commitment: data });
  } catch (error) {
    console.error('Commitment save error:', error);
    return NextResponse.json({ error: 'Failed to save commitment' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, completed_at } = body;

    if (!id) {
      return NextResponse.json({ error: 'Commitment ID required' }, { status: 400 });
    }

    const update: any = { updated_at: new Date().toISOString() };
    if (status) update.status = status;
    if (completed_at !== undefined) update.completed_at = completed_at;

    const { data, error } = await supabase
      .from('commitments')
      .update(update)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ commitment: data });
  } catch (error) {
    console.error('Commitment update error:', error);
    return NextResponse.json({ error: 'Failed to update commitment' }, { status: 500 });
  }
}

