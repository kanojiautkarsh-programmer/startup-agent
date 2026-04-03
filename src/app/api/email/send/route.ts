import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendMagicLinkEmail } from '@/lib/email';
import { validateCSRF, sanitizeError, checkRateLimit, getClientIP } from '@/lib/security-utils';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  if (!validateCSRF(request)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  const ip = getClientIP(request);
  const rateLimit = await checkRateLimit(`email:${ip}`, 10, 60 * 1000);
  if (!rateLimit.passed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { action, email, name, userId } = body;

    if (!email || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: email, action' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'welcome': {
        const result = await sendWelcomeEmail(email, name);
        return NextResponse.json(result);
      }

      case 'password_reset': {
        if (!userId) {
          return NextResponse.json(
            { error: 'userId required for password reset' },
            { status: 400 }
          );
        }
        
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
        });

        if (error || !data?.properties?.action_link) {
          return NextResponse.json(
            { error: 'Failed to generate reset link' },
            { status: 500 }
          );
        }

        const token = data.properties.action_link.split('token=')[1] || '';
        const result = await sendPasswordResetEmail(email, token);
        return NextResponse.json(result);
      }

      case 'magic_link': {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        });

        if (error || !data?.properties?.action_link) {
          return NextResponse.json(
            { error: 'Failed to generate magic link' },
            { status: 500 }
          );
        }

        const result = await sendMagicLinkEmail(email, data.properties.action_link);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    );
  }
}

