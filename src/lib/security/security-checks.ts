import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/audit/logger';
import type { AuditAction, AuditEventType } from '@/lib/audit/types';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SecurityCheckResult {
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
}

export async function performSecurityCheck(
  userId: string,
  checkType: 'login' | 'api_access' | 'data_export' | 'admin_action',
  context: { ipAddress?: string; userAgent?: string; metadata?: Record<string, unknown> }
): Promise<SecurityCheckResult> {
  const results: SecurityCheckResult[] = [];

  switch (checkType) {
    case 'login':
      results.push(await checkLoginAnomalies(userId, context));
      results.push(await checkFailedLoginRate(userId));
      break;
    case 'api_access':
      results.push(await checkRateLimit(userId, 'api'));
      break;
    case 'data_export':
      results.push(await checkExportFrequency(userId));
      break;
    case 'admin_action':
      results.push(await checkAdminPrivileges(userId));
      break;
  }

  const criticalResult = results.find(r => r.severity === 'critical');
  if (criticalResult) return criticalResult;

  const highResult = results.find(r => r.severity === 'high');
  if (highResult) return highResult;

  const mediumResult = results.find(r => r.severity === 'medium');
  if (mediumResult) return mediumResult;

  return {
    passed: true,
    severity: 'low',
    message: 'Security check passed',
  };
}

async function checkLoginAnomalies(
  userId: string,
  context: { ipAddress?: string; userAgent?: string }
): Promise<SecurityCheckResult> {
  const { data: recentLogs } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('action', 'login')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (!recentLogs || recentLogs.length === 0) {
    return { passed: true, severity: 'low', message: 'No recent login anomalies' };
  }

  const uniqueIPs = new Set(recentLogs.map((l: { ip_address?: string }) => l.ip_address));
  const uniqueUserAgents = new Set(recentLogs.map((l: { user_agent?: string }) => l.user_agent));

  if (uniqueIPs.size > 5) {
    await logAuditEvent({
      userId,
      action: 'anomaly_detected',
      resourceType: 'security_check',
      metadata: {
        checkType: 'multiple_ips',
        ipCount: uniqueIPs.size,
        ips: Array.from(uniqueIPs),
      },
      status: 'success',
      ...context,
    });

    return {
      passed: true,
      severity: 'medium',
      message: 'Multiple IP addresses detected in recent logins',
      details: `${uniqueIPs.size} different IPs detected`,
    };
  }

  return { passed: true, severity: 'low', message: 'Login patterns normal' };
}

async function checkFailedLoginRate(userId: string): Promise<SecurityCheckResult> {
  const { data: failedLogins } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('action', 'login_failed')
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

  const count = failedLogins?.length || 0;

  if (count >= 5) {
    await supabaseAdmin.from('security_events').insert({
      user_id: userId,
      event_type: 'failed_login',
      severity: 'high',
      description: `Multiple failed login attempts: ${count}`,
    });

    return {
      passed: false,
      severity: 'high',
      message: 'Account temporarily locked due to too many failed attempts',
    };
  }

  return { passed: true, severity: 'low', message: 'Failed login rate normal' };
}

async function checkRateLimit(
  userId: string,
  type: 'api' | 'export'
): Promise<SecurityCheckResult> {
  const windowMs = type === 'api' ? 60 * 1000 : 60 * 60 * 1000;
  const maxRequests = type === 'api' ? 100 : 10;

  const { data: recentRequests } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('resource_type', type === 'api' ? 'api' : 'data_export')
    .gte('created_at', new Date(Date.now() - windowMs).toISOString());

  const count = recentRequests?.length || 0;

  if (count >= maxRequests) {
    await logAuditEvent({
      userId,
      action: 'rate_limit_exceeded',
      resourceType: type,
      metadata: { requestCount: count, windowMs },
      status: 'blocked',
      failureReason: `Rate limit exceeded: ${count} requests in ${windowMs}ms`,
    });

    return {
      passed: false,
      severity: 'medium',
      message: 'Rate limit exceeded. Please try again later.',
    };
  }

  return { passed: true, severity: 'low', message: 'Rate limit check passed' };
}

async function checkExportFrequency(userId: string): Promise<SecurityCheckResult> {
  const { data: recentExports } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('action', 'data_exported')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const count = recentExports?.length || 0;

  if (count >= 5) {
    return {
      passed: false,
      severity: 'medium',
      message: 'Too many data exports in the last 24 hours. Please wait.',
    };
  }

  return { passed: true, severity: 'low', message: 'Export frequency normal' };
}

async function checkAdminPrivileges(userId: string): Promise<SecurityCheckResult> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  if (profile?.plan !== 'enterprise') {
    await logAuditEvent({
      userId,
      action: 'policy_violation',
      resourceType: 'admin_action',
      metadata: { attemptedAction: 'admin_action' },
      status: 'blocked',
      failureReason: 'Non-admin user attempted admin action',
    });

    return {
      passed: false,
      severity: 'high',
      message: 'Admin privileges required for this action',
    };
  }

  return { passed: true, severity: 'low', message: 'Admin privileges verified' };
}

export async function recordSecurityEvent(
  userId: string,
  eventType: SecurityCheckResult['message'] extends string ? string : never,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await supabaseAdmin.from('security_events').insert({
    user_id: userId,
    event_type: eventType as 'anomaly_detected',
    severity,
    description,
    metadata,
  });

  if (severity === 'high' || severity === 'critical') {
    await logAuditEvent({
      userId,
      action: 'anomaly_detected',
      resourceType: 'security_event',
      metadata: { eventType, severity, description, ...metadata },
      status: 'success',
    });
  }
}
