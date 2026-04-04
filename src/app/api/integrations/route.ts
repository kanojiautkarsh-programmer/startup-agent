import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ integrations: integrations || [] });
  } catch (error) {
    console.error('List integrations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

