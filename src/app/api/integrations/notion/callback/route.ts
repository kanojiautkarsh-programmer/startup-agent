import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptForStorage } from '@/lib/security/encryption';

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/notion/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      return NextResponse.redirect(new URL(`/settings?error=notion_${error || 'no_code'}`, request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const workspaceId = tokenData.workspace_id;
    const workspaceName = tokenData.workspace_name;

    const encryptedAccessToken = encryptForStorage(accessToken);
    const encryptedRefreshToken = encryptForStorage(tokenData.refresh_token);

    await supabase.from('integrations').upsert({
      user_id: user.id,
      provider: 'notion',
      status: 'connected',
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      token_expires_at: tokenData.expires_at 
        ? new Date(tokenData.expires_at * 1000).toISOString()
        : null,
      metadata: {
        workspace_id: workspaceId,
        workspace_name: workspaceName,
      },
    }, {
      onConflict: 'user_id,provider',
    });

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'integration_connected',
      resource_type: 'notion',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.redirect(new URL('/settings?success=notion_connected', request.url));
  } catch (error) {
    console.error('Notion callback error:', error);
    return NextResponse.redirect(new URL('/settings?error=notion_callback_failed', request.url));
  }
}
