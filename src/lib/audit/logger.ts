import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuditEvent, AuditAction, AuditEventType } from './types';
import { EVENT_CATEGORIES } from './types';

function getAuditClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface LogAuditParams {
  userId: string;
  action: AuditAction;
  eventType?: AuditEventType;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  status: 'success' | 'failure' | 'blocked';
  failureReason?: string;
}

export async function logAuditEvent(params: LogAuditParams): Promise<string | null> {
  try {
    const auditClient = getAuditClient();
    const { data, error } = await auditClient
      .from('audit_logs')
      .insert({
        user_id: params.userId,
        event_type: params.eventType || determineEventType(params.action),
        event_category: params.eventType 
          ? EVENT_CATEGORIES[params.eventType] 
          : determineEventCategory(params.action),
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        action: params.action,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        metadata: params.metadata,
        status: params.status,
        failure_reason: params.failureReason,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log audit event:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return null;
  }
}

function determineEventType(action: AuditAction): AuditEventType {
  if (['login', 'logout', 'login_failed', 'password_change', 'password_reset', 
       'mfa_enabled', 'mfa_disabled', 'mfa_challenge', 'sso_login', 'saml_assertion'].includes(action)) {
    return 'authentication';
  }
  if (['access_granted', 'access_revoked', 'permission_changed'].includes(action)) {
    return 'authorization';
  }
  if (['data_exported', 'data_imported', 'api_key_used'].includes(action)) {
    return 'data_access';
  }
  if (['data_deleted'].includes(action)) {
    return 'data_deletion';
  }
  if (['settings_updated', 'api_key_created', 'api_key_deleted', 'encryption_key_rotated'].includes(action)) {
    return 'settings_change';
  }
  if (['anomaly_detected', 'rate_limit_exceeded', 'policy_violation', 'session_terminated'].includes(action)) {
    return 'security_event';
  }
  return 'compliance_event';
}

function determineEventCategory(action: AuditAction): AuditEvent['event_category'] {
  if (['login', 'logout', 'login_failed', 'password_change', 'password_reset', 
       'mfa_enabled', 'mfa_disabled', 'mfa_challenge', 'sso_login', 'saml_assertion'].includes(action)) {
    return 'auth';
  }
  if (['data_exported', 'data_imported', 'data_deleted', 'api_key_used'].includes(action)) {
    return 'data';
  }
  if (['anomaly_detected', 'rate_limit_exceeded', 'policy_violation', 'settings_updated',
       'api_key_created', 'api_key_deleted', 'encryption_key_rotated'].includes(action)) {
    return 'security';
  }
  return 'compliance';
}

export async function getAuditLogs(
  filters: {
    userId?: string;
    eventType?: AuditEventType;
    action?: AuditAction;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    status?: AuditEvent['status'];
    limit?: number;
    offset?: number;
  }
) {
  const auditClient = getAuditClient();
  let query = auditClient
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType);
  }
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return { data, count };
}

export async function exportAuditLogs(
  filters: {
    startDate: string;
    endDate: string;
    eventTypes?: AuditEventType[];
  }
) {
  const auditClient = getAuditClient();
  let query = auditClient
    .from('audit_logs')
    .select('*')
    .gte('created_at', filters.startDate)
    .lte('created_at', filters.endDate)
    .order('created_at', { ascending: true });

  if (filters.eventTypes && filters.eventTypes.length > 0) {
    query = query.in('event_type', filters.eventTypes);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export function getRequestContext(request: Request): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}
