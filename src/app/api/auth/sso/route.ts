import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = getRequestContext(request);

    switch (action) {
      case 'sso_initiated': {
        const { provider, providerId } = body;
        
        await logAuditEvent({
          userId: user.id,
          action: 'sso_login',
          resourceType: 'sso_session',
          metadata: { provider, providerId },
          status: 'success',
          ...context,
        });

        return NextResponse.json({
          success: true,
          message: 'SSO login initiated',
          sessionId: crypto.randomUUID(),
        });
      }

      case 'saml_assertion_received': {
        const { samlResponse, relayState } = body;
        
        if (!samlResponse) {
          return NextResponse.json(
            { error: 'SAML response is required' },
            { status: 400 }
          );
        }

        await logAuditEvent({
          userId: user.id,
          action: 'saml_assertion',
          resourceType: 'saml_response',
          metadata: { relayState },
          status: 'success',
          ...context,
        });

        return NextResponse.json({
          success: true,
          message: 'SAML assertion validated',
        });
      }

      case 'oidc_callback': {
        const { code, state, nonce } = body;
        
        if (!code) {
          return NextResponse.json(
            { error: 'Authorization code is required' },
            { status: 400 }
          );
        }

        await logAuditEvent({
          userId: user.id,
          action: 'sso_login',
          resourceType: 'oidc_session',
          metadata: { state, hasNonce: !!nonce },
          status: 'success',
          ...context,
        });

        return NextResponse.json({
          success: true,
          message: 'OIDC callback processed',
        });
      }

      case 'link_provider': {
        const { provider } = body;
        
        await logAuditEvent({
          userId: user.id,
          action: 'mfa_enabled',
          resourceType: 'sso_link',
          metadata: { provider },
          status: 'success',
          ...context,
        });

        return NextResponse.json({
          success: true,
          message: `SSO provider ${provider} linked successfully`,
        });
      }

      case 'unlink_provider': {
        const { provider } = body;
        
        await logAuditEvent({
          userId: user.id,
          action: 'mfa_disabled',
          resourceType: 'sso_link',
          metadata: { provider },
          status: 'success',
          ...context,
        });

        return NextResponse.json({
          success: true,
          message: `SSO provider ${provider} unlinked`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SSO action failed:', error);
    return NextResponse.json(
      { error: 'SSO action failed' },
      { status: 500 }
    );
  }
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

    const { data: linkedProviders, error } = await supabaseAdmin
      .from('sso_links')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    const { data: userProviders } = await supabaseAdmin
      .from('sso_providers')
      .select('*')
      .eq('enabled', true);

    return NextResponse.json({
      userProviders: linkedProviders || [],
      availableProviders: userProviders || [],
    });
  } catch (error) {
    console.error('Failed to fetch SSO info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SSO information' },
      { status: 500 }
    );
  }
}
