import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'notion')
      .single();

    const { data: documents } = await supabase
      .from('documents')
      .select('id, title, source_type, is_indexed, created_at')
      .eq('user_id', user.id)
      .eq('source_type', 'notion')
      .order('created_at', { ascending: false });

    const { data: recentSync } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('action', 'notion_sync_completed')
      .order('created_at', { ascending: false })
      .limit(1);

    return NextResponse.json({
      connected: integration?.status === 'connected',
      workspaceName: integration?.metadata?.workspace_name || null,
      lastSync: recentSync?.[0]?.created_at || null,
      documentsCount: documents?.length || 0,
      documents: documents?.slice(0, 10) || []
    });
  } catch (error) {
    console.error('Notion status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

