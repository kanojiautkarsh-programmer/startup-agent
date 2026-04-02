import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

    const { data: providers, error } = await supabaseAdmin
      .from('sso_providers')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ providers: providers || [] });
  } catch (error) {
    console.error('SSO providers fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch SSO providers' }, { status: 500 });
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
    const { name, provider, issuer, ssoUrl, clientId, clientSecret, allowedDomains } = body;

    if (!name || !provider || !issuer) {
      return NextResponse.json(
        { error: 'Missing required fields: name, provider, issuer' },
        { status: 400 }
      );
    }

    if (provider === 'saml' && !ssoUrl) {
      return NextResponse.json(
        { error: 'SAML requires ssoUrl' },
        { status: 400 }
      );
    }

    if (provider === 'oidc' && (!clientId || !clientSecret)) {
      return NextResponse.json(
        { error: 'OIDC requires clientId and clientSecret' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { data, error } = await supabaseAdmin
      .from('sso_providers')
      .insert({
        name,
        provider,
        enabled: false,
        entity_id: issuer,
        issuer,
        sso_url: ssoUrl || null,
        acs_url: provider === 'saml' ? `${baseUrl}/api/auth/sso/saml/callback` : null,
        client_id: clientId || null,
        client_secret_encrypted: clientSecret ? Buffer.from(clientSecret).toString('base64') : null,
        authorization_endpoint: provider === 'oidc' ? `${issuer}/authorize` : null,
        token_endpoint: provider === 'oidc' ? `${issuer}/oauth/token` : null,
        userinfo_endpoint: provider === 'oidc' ? `${issuer}/userinfo` : null,
        allowed_domains: allowedDomains || [],
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      provider: data,
      message: 'SSO provider created. Enable it after configuring your identity provider.' 
    });
  } catch (error) {
    console.error('SSO provider create error:', error);
    return NextResponse.json({ error: 'Failed to create SSO provider' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('id');

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('sso_providers')
      .delete()
      .eq('id', providerId)
      .eq('created_by', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'SSO provider deleted' });
  } catch (error) {
    console.error('SSO provider delete error:', error);
    return NextResponse.json({ error: 'Failed to delete SSO provider' }, { status: 500 });
  }
}
