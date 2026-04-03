import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { validateCSRF, sanitizeError, checkRateLimit, getClientIP } from '@/lib/security-utils';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key);
}

async function isAdmin(supabaseAdmin: SupabaseClient, userId: string): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const { data: { user } } = await supabaseAdmin.auth.getUser();
  
  if (!user || !user.email) return false;
  
  if (adminEmails.includes(user.email.toLowerCase())) return true;
  
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();
  
  return profile?.plan === 'enterprise';
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
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!validateCSRF(request)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  const ip = getClientIP(request);
  const rateLimit = await checkRateLimit(`sso:${ip}`, 5, 60 * 1000);
  if (!rateLimit.passed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

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

    const isUserAdmin = await isAdmin(supabaseAdmin, user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can create SSO providers' },
        { status: 403 }
      );
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
        name: name.slice(0, 100),
        provider,
        enabled: false,
        entity_id: issuer.slice(0, 500),
        issuer: issuer.slice(0, 500),
        sso_url: ssoUrl ? ssoUrl.slice(0, 500) : null,
        acs_url: provider === 'saml' ? `${baseUrl}/api/auth/sso/saml/callback` : null,
        client_id: clientId || null,
        client_secret_encrypted: clientSecret ? Buffer.from(clientSecret).toString('base64') : null,
        authorization_endpoint: provider === 'oidc' ? `${issuer}/authorize` : null,
        token_endpoint: provider === 'oidc' ? `${issuer}/oauth/token` : null,
        userinfo_endpoint: provider === 'oidc' ? `${issuer}/userinfo` : null,
        allowed_domains: (allowedDomains || []).slice(0, 20).map((d: string) => d.slice(0, 100)),
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
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!validateCSRF(request)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

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

    const isUserAdmin = await isAdmin(supabaseAdmin, user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can delete SSO providers' },
        { status: 403 }
      );
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
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    );
  }
}
