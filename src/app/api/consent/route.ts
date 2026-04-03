import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { logAuditEvent, getRequestContext } from '@/lib/audit/logger';
import { CONSENT_VERSION } from '@/lib/security/zero-data-training';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
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

    const { data: consent, error } = await supabaseAdmin
      .from('data_training_consent')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      optedOut: consent?.opted_out ?? true,
      consentVersion: consent?.consent_version ?? CONSENT_VERSION,
      optOutDate: consent?.opt_out_date,
      createdAt: consent?.created_at,
    });
  } catch (error) {
    console.error('Consent GET error:', error);
    return NextResponse.json({ error: 'Failed to get consent' }, { status: 500 });
  }
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

    const body = await request.json();
    const { optedOut = true } = body;

    const context = getRequestContext(request);

    const { data: existing } = await supabaseAdmin
      .from('data_training_consent')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('data_training_consent')
        .update({
          opted_out: optedOut,
          opt_out_date: optedOut ? new Date().toISOString() : null,
          ip_address: context.ipAddress,
          user_agent: context.userAgent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabaseAdmin
        .from('data_training_consent')
        .insert({
          user_id: user.id,
          opted_out: optedOut,
          consent_version: CONSENT_VERSION,
          opt_out_date: optedOut ? new Date().toISOString() : null,
          ip_address: context.ipAddress,
          user_agent: context.userAgent,
        });
    }

    await logAuditEvent({
      userId: user.id,
      action: 'settings_updated',
      resourceType: 'data_consent',
      metadata: { optedOut, version: CONSENT_VERSION },
      status: 'success',
      ...context,
    });

    return NextResponse.json({
      success: true,
      message: optedOut ? 'Opted out of data training' : 'Opted in to data training',
    });
  } catch (error) {
    console.error('Consent POST error:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}

