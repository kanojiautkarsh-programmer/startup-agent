import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptForStorage } from '@/lib/security/encryption';

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || '';
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const NOTION_REDIRECT_URI = `${APP_URL}/api/integrations/notion/callback`;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!NOTION_CLIENT_ID) {
      throw new Error('NOTION_CLIENT_ID not configured');
    }

    const state = crypto.randomUUID();
    
    const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
    authUrl.searchParams.set('client_id', NOTION_CLIENT_ID);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('owner', 'user');
    authUrl.searchParams.set('redirect_uri', NOTION_REDIRECT_URI);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString() as string);
  } catch (error) {
    console.error('Notion auth error:', error);
    return NextResponse.redirect(new URL('/settings?error=notion_auth_failed', request.url));
  }
}

