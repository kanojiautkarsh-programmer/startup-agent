import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-secret-change-in-production';

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function createCSRFToken(): { token: string; formField: string } {
  const token = generateCSRFToken();
  return {
    token,
    formField: `<input type="hidden" name="csrf_token" value="${token}" />`
  };
}

export function validateCSRF(request: NextRequest): boolean {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const cookieToken = request.cookies.get('csrf_token')?.value;

  if (!csrfToken || !cookieToken) {
    return false;
  }

  return csrfToken === cookieToken;
}

export function withCSRFValidation(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    if (!validateCSRF(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }
    return handler(request, ...args);
  };
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .trim();
}

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function sanitizeEmailHeader(value: string): string {
  if (!value) return '';
  return value
    .replace(/[\r\n<>()]/g, '')
    .slice(0, 100);
}

export interface RateLimitResult {
  passed: boolean;
  remaining: number;
  resetAt: number;
}

const RATE_LIMIT_CACHE = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const entry = RATE_LIMIT_CACHE.get(identifier);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_CACHE.set(identifier, { count: 1, resetAt: now + windowMs });
    return { passed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { passed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { passed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export async function checkFailedLoginRate(userId: string | null, ip: string): Promise<RateLimitResult> {
  const identifier = userId || `ip:${ip}`;
  const MAX_FAILED_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000;
  return checkRateLimit(`failed_login:${identifier}`, MAX_FAILED_ATTEMPTS, WINDOW_MS);
}

export async function checkAuthRateLimit(ip: string): Promise<RateLimitResult> {
  const MAX_AUTH_REQUESTS = 10;
  const WINDOW_MS = 60 * 1000;
  return checkRateLimit(`auth:${ip}`, MAX_AUTH_REQUESTS, WINDOW_MS);
}

export async function checkChatRateLimit(userId: string): Promise<RateLimitResult> {
  const MAX_CHAT_REQUESTS = 30;
  const WINDOW_MS = 60 * 1000;
  return checkRateLimit(`chat:${userId}`, MAX_CHAT_REQUESTS, WINDOW_MS);
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    if (process.env.NODE_ENV === 'production') {
      return 'An unexpected error occurred';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
