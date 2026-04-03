import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
    };

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profile) exportData.profile = profile;

    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', user.id);
    if (conversations) {
      exportData.conversations = conversations;
      
      const conversationIds = conversations.map((c: { id: string }) => c.id);
      if (conversationIds.length > 0) {
        const { data: messages } = await supabaseAdmin
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds);
        if (messages) exportData.messages = messages;
      }
    }

    const { data: memories } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('user_id', user.id);
    if (memories) exportData.memories = memories;

    const { data: goals } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', user.id);
    if (goals) exportData.goals = goals;

    const { data: consent } = await supabaseAdmin
      .from('data_training_consent')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (consent) exportData.consent = consent;

    const jsonString = JSON.stringify(exportData, null, 2);
    const base64Data = Buffer.from(jsonString).toString('base64');

    return NextResponse.json({
      success: true,
      data: base64Data,
      filename: `data-export-${new Date().toISOString().split('T')[0]}.json`,
      size: jsonString.length,
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

