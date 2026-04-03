import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_EVENT_TYPES = [
  'page_view',
  'feature_used',
  'ai_chat',
  'document_uploaded',
  'goal_created',
  'goal_completed',
  'integration_connected',
  'integration_disconnected',
  'onboarding_completed',
  'search_performed',
  'export_requested',
  'button_clicked',
  'form_submitted',
  'error_occurred',
  'session_start',
  'session_end'
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      event_type, 
      event_data = {},
      page_path,
      referrer,
      session_id
    } = body;

    if (!event_type || !VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const deviceInfo = parseUserAgent(userAgent);

    const event = {
      user_id: user.id,
      event_type,
      event_data,
      page_path: page_path || request.headers.get('referer'),
      referrer,
      user_agent: userAgent,
      ...deviceInfo
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert(event);

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    if (session_id && event_type === 'session_end') {
      await supabase
        .from('user_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('session_id', session_id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const eventType = searchParams.get('event_type');

    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('analytics_events')
      .select('event_type, event_data, created_at, page_path')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: events, error } = await query;

    if (error) throw error;

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false });

    const { data: featureUsage } = await supabase
      .from('feature_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('usage_date', startDate.toISOString().split('T')[0])
      .order('usage_count', { ascending: false });

    const summary = {
      totalEvents: events?.length || 0,
      totalSessions: sessions?.length || 0,
      totalDuration: sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0,
      eventBreakdown: {} as Record<string, number>,
      topPages: {} as Record<string, number>,
      featureUsage: featureUsage || []
    };

    events?.forEach(e => {
      summary.eventBreakdown[e.event_type] = (summary.eventBreakdown[e.event_type] || 0) + 1;
      if (e.page_path) {
        summary.topPages[e.page_path] = (summary.topPages[e.page_path] || 0) + 1;
      }
    });

    return NextResponse.json({
      summary,
      events: events?.slice(0, 100),
      sessions: sessions?.slice(0, 50)
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parseUserAgent(userAgent: string) {
  const deviceType = /mobile|android|iphone|ipad|ipod/i.test(userAgent) ? 'mobile' : 'desktop';
  
  let browser = 'unknown';
  let os = 'unknown';
  
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/edge/i.test(userAgent)) browser = 'Edge';
  
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/mac/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS';
  
  return { device_type: deviceType, browser, os };
}

