import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { SECURITY_HEADERS, generateCSRFToken } from '@/lib/security-utils'

export async function middleware(request: NextRequest) {
  let response = await updateSession(request)

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (request.nextUrl.pathname.startsWith('/api/') && request.method !== 'GET') {
    const csrfToken = request.cookies.get('csrf_token')?.value;
    if (!csrfToken) {
      const newToken = generateCSRFToken();
      response.cookies.set('csrf_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
