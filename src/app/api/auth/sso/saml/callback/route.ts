import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { decodeSAMLResponse } from '@/lib/security/saml';
import { logAuditEvent, getRequestContext } from '@/lib/audit/logger';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const samlResponse = formData.get('SAMLResponse') as string;
    const relayState = formData.get('RelayState') as string;

    if (!samlResponse) {
      return NextResponse.redirect(
        new URL('/login?error=saml_response_missing', request.url)
      );
    }

    const { assertion, isValid, errors } = decodeSAMLResponse(samlResponse);

    if (!isValid) {
      console.error('SAML validation failed:', errors);
      
      await logAuditEvent({
        userId: 'anonymous',
        action: 'login_failed',
        resourceType: 'saml_auth',
        metadata: { errors },
        status: 'failure',
        failureReason: errors.join(', '),
        ...getRequestContext(request),
      });

      return NextResponse.redirect(
        new URL('/login?error=saml_validation_failed', request.url)
      );
    }

    let returnTo = '/dashboard';
    let providerId = '';

    if (relayState) {
      try {
        const decoded = JSON.parse(Buffer.from(relayState, 'base64').toString());
        returnTo = decoded.returnTo || '/dashboard';
        providerId = decoded.providerId || '';
      } catch {
        // Use defaults
      }
    }

    const email = assertion.subject.nameId;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error: findUserError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (findUserError || !profile) {
      await logAuditEvent({
        userId: 'anonymous',
        action: 'login_failed',
        resourceType: 'saml_auth',
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
      action: 'saml_assertion',
      resourceType: 'saml_auth',
      metadata: {
        providerId,
        email,
        attributes: Object.keys(assertion.attributes),
      },
      status: 'success',
      ...getRequestContext(request),
    });

    await supabaseAdmin
      .from('sso_sessions')
      .insert({
        user_id: profile.id,
        provider: 'saml',
        provider_id: providerId || null,
        email: email,
        return_to: returnTo,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    return NextResponse.redirect(
      new URL(`/login/sso-verify?email=${encodeURIComponent(email)}`, request.url)
    );
  } catch (error) {
    console.error('SAML callback processing failed:', error);
    return NextResponse.redirect(
      new URL('/login?error=saml_callback_failed', request.url)
    );
  }
}

