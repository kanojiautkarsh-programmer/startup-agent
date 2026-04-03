import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac } from 'crypto';

function getCSRFSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('CSRF_SECRET environment variable is required in production');
  }
  return secret || 'dev-secret-do-not-use-in-production';
}

export function generateCSRFToken(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const randomPart = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  
  const timestamp = Date.now().toString(36);
  const hmac = createHmac('sha256', getCSRFSecret());
  hmac.update(`${randomPart}:${timestamp}`);
  const signature = hmac.digest('base64url').slice(0, 16);
  
  return `${randomPart}.${timestamp}.${signature}`;
}

export function validateCSRFToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [randomPart, timestamp, signature] = parts;
  
  const tokenAge = Date.now() - parseInt(timestamp, 36) * 1000;
  const maxAge = 24 * 60 * 60 * 1000;
  if (tokenAge > maxAge || tokenAge < 0) {
    return false;
  }

  const expectedHmac = createHmac('sha256', getCSRFSecret());
  expectedHmac.update(`${randomPart}:${timestamp}`);
  const expectedSignature = expectedHmac.digest('base64url').slice(0, 16);

  return signature === expectedSignature;
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

  return csrfToken === cookieToken && validateCSRFToken(cookieToken);
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
