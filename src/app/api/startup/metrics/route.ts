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
    const period = searchParams.get('period') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const { data, error } = await supabase
      .from('startup_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ metrics: data || [] });
  } catch (error) {
    console.error('Metrics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
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
    const { metric_date, mrr, arr, active_users, trials, paying_customers, churn_rate, burn_rate, runway_months, runway_end_date, arr_growth_rate, net_revenue, cac, ltv, notes } = body;

    const { data, error } = await supabase
      .from('startup_metrics')
      .upsert({
        user_id: user.id,
        metric_date,
        mrr,
        arr,
        active_users,
        trials,
        paying_customers,
        churn_rate,
        burn_rate,
        runway_months,
        runway_end_date,
        arr_growth_rate,
        net_revenue,
        cac,
        ltv,
        notes
      }, {
        onConflict: 'user_id,metric_date'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ metric: data });
  } catch (error) {
    console.error('Metrics save error:', error);
    return NextResponse.json({ error: 'Failed to save metric' }, { status: 500 });
  }
}
