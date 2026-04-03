import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { 
  generateCodeVerifier, 
  generateCodeChallenge, 
  generateState,
  buildAuthorizationUrl,
  type OIDCConfig 
} from '@/lib/security/oidc';
import { logAuditEvent, getRequestContext } from '@/lib/audit/logger';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');
    const returnTo = searchParams.get('return_to') || '/dashboard';

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: provider, error } = await supabaseAdmin
      .from('sso_providers')
      .select('*')
      .eq('id', providerId)
      .eq('provider', 'oidc')
      .eq('enabled', true)
      .single();

    if (error || !provider) {
      return NextResponse.json(
        { error: 'OIDC provider not found or disabled' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const config: OIDCConfig = {
      issuer: provider.issuer || provider.entity_id || '',
      clientId: provider.client_id || '',
      clientSecret: provider.client_secret,
      redirectUri: `${baseUrl}/api/auth/sso/oidc/callback`,
      scopes: ['openid', 'email', 'profile', 'offline_access'],
      authorizationEndpoint: provider.authorization_endpoint,
      tokenEndpoint: provider.token_endpoint,
    };

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();
    const nonce = generateState();

    const authUrl = buildAuthorizationUrl(config, state, codeChallenge, nonce);
    const stateData = JSON.stringify({
      returnTo,
      providerId,
      nonce,
      codeVerifier,
    });
    const encodedState = Buffer.from(stateData).toString('base64');

    const response = NextResponse.redirect(authUrl);
    
    response.cookies.set('oidc_state', encodedState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error('OIDC SSO initiation failed:', error);
    return NextResponse.redirect(new URL('/login?error=oidc_init_failed', request.url));
  }
}

