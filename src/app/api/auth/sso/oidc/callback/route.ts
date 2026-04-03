import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { 
  exchangeCodeForTokens, 
  getUserInfo, 
  decodeIdToken, 
  validateIdToken,
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
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      console.error('OIDC error:', errorParam, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=oidc_${errorParam}&description=${encodeURIComponent(errorDescription || '')}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=oidc_missing_params', request.url)
      );
    }

    const stateCookie = request.cookies.get('oidc_state')?.value;
    
    if (!stateCookie) {
      return NextResponse.redirect(
        new URL('/login?error=oidc_state_missing', request.url)
      );
    }

    const stateData = JSON.parse(Buffer.from(stateCookie, 'base64').toString());
    const { returnTo, providerId, nonce, codeVerifier } = stateData;

    if (state !== stateData.state) {
      return NextResponse.redirect(
        new URL('/login?error=oidc_state_invalid', request.url)
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: provider, error: providerError } = await supabaseAdmin
      .from('sso_providers')
      .select('*')
      .eq('id', providerId)
      .eq('provider', 'oidc')
      .eq('enabled', true)
      .single();

    if (providerError || !provider) {
      return NextResponse.redirect(
        new URL('/login?error=oidc_provider_not_found', request.url)
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

    const tokens = await exchangeCodeForTokens(config, code, codeVerifier);

    if (tokens.idToken) {
      const idTokenClaims = decodeIdToken(tokens.idToken);
      const validation = validateIdToken(idTokenClaims, config, nonce);
      
      if (!validation.valid) {
        console.error('ID Token validation failed:', validation.errors);
        return NextResponse.redirect(
          new URL(`/login?error=oidc_token_invalid`, request.url)
        );
      }
    }

    const userInfo = await getUserInfo(config, tokens.accessToken);
    const email = userInfo.email;

    if (!email) {
      return NextResponse.redirect(
        new URL('/login?error=oidc_email_required', request.url)
      );
    }

    const { data: profile, error: findUserError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (findUserError || !profile) {
      await logAuditEvent({
        userId: 'anonymous',
        action: 'login_failed',
        resourceType: 'oidc_auth',
        metadata: { email, reason: 'user_not_found' },
        status: 'failure',
        failureReason: 'User not found with SSO email',
        ...getRequestContext(request),
      });

      return NextResponse.redirect(
        new URL(`/signup?email=${encodeURIComponent(email)}&sso=true&error=user_not_found`, request.url)
      );
    }

    await logAuditEvent({
      userId: profile.id,
      action: 'sso_login',
      resourceType: 'oidc_auth',
      metadata: {
        providerId,
        email,
        provider: provider.name,
      },
      status: 'success',
      ...getRequestContext(request),
    });

    await supabaseAdmin
      .from('sso_sessions')
      .insert({
        user_id: profile.id,
        provider: 'oidc',
        provider_id: providerId || null,
        email: email,
        return_to: returnTo,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    const response = NextResponse.redirect(
      new URL(`/login/sso-verify?email=${encodeURIComponent(email)}`, request.url)
    );

    response.cookies.delete('oidc_state');

    return response;
  } catch (error) {
    console.error('OIDC callback processing failed:', error);
    return NextResponse.redirect(
      new URL('/login?error=oidc_callback_failed', request.url)
    );
  }
}

