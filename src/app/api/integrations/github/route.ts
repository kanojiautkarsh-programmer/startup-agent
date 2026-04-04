import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const GITHUB_REDIRECT_URI = `${APP_URL}/api/integrations/github/callback`;
const SCOPES = 'read:user user:email repo';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!GITHUB_CLIENT_ID) {
      throw new Error('GITHUB_CLIENT_ID not configured');
    }

    const state = crypto.randomUUID();

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString() as string);
  } catch (error) {
    console.error('GitHub auth error:', error);
    return NextResponse.redirect(new URL('/settings?error=github_auth_failed', request.url));
  }
}

