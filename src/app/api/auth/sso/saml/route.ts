import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { 
  generateSAMLRequest, 
  encodeSAMLRequest, 
} from '@/lib/security/saml';
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
      .eq('provider', 'saml')
      .eq('enabled', true)
      .single();

    if (error || !provider) {
      return NextResponse.json(
        { error: 'SAML provider not found or disabled' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const config = {
      privateKey: provider.private_key || '',
      certificate: provider.certificate || '',
      issuer: provider.issuer || provider.entity_id || '',
      acsUrl: `${baseUrl}/api/auth/sso/saml/callback`,
      attributeMapping: {
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName',
      },
    };

    const samlRequest = generateSAMLRequest(config);
    const encodedRequest = encodeSAMLRequest(samlRequest);

    const redirectUrl = new URL(provider.sso_url || '');
    redirectUrl.searchParams.set('SAMLRequest', encodedRequest);
    redirectUrl.searchParams.set('RelayState', Buffer.from(JSON.stringify({
      returnTo,
      providerId,
      requestId: samlRequest.id,
    })).toString('base64'));

    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.set('saml_request_id', samlRequest.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5,
    });

    return response;
  } catch (error) {
    console.error('SAML SSO initiation failed:', error);
    return NextResponse.redirect(new URL('/login?error=saml_init_failed', request.url));
  }
}

