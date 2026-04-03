import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptForStorage } from '@/lib/security/encryption';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      return NextResponse.redirect(new URL(`/settings?error=github_${error || 'no_code'}`, request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('No access token received');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const githubUser = await userResponse.json();

    const encryptedAccessToken = encryptForStorage(accessToken);

    await supabase.from('integrations').upsert({
      user_id: user.id,
      provider: 'github',
      status: 'connected',
      access_token_encrypted: encryptedAccessToken,
      metadata: {
        github_username: githubUser.login,
        github_id: githubUser.id,
        avatar_url: githubUser.avatar_url,
      },
    }, {
      onConflict: 'user_id,provider',
    });

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'integration_connected',
      resource_type: 'github',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.redirect(new URL('/settings?success=github_connected', request.url));
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(new URL('/settings?error=github_callback_failed', request.url));
  }
}

