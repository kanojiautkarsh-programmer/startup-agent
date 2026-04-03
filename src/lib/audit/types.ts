export interface AuditEvent {
  id?: string;
  user_id: string;
  event_type: AuditEventType;
  event_category: AuditEventCategory;
  resource_type: string;
  resource_id?: string;
  action: AuditAction;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  status: 'success' | 'failure' | 'blocked';
  failure_reason?: string;
  timestamp?: string;
  created_at?: string;
}

export type AuditEventType =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'settings_change'
  | 'security_event'
  | 'admin_action'
  | 'compliance_event';

export type AuditEventCategory =
  | 'auth'
  | 'data'
  | 'security'
  | 'compliance'
  | 'admin';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'password_reset'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_challenge'
  | 'sso_login'
  | 'saml_assertion'
  | 'sso_provider_linked'
  | 'sso_provider_unlinked'
  | 'api_key_created'
  | 'api_key_deleted'
  | 'api_key_used'
  | 'data_exported'
  | 'data_imported'
  | 'data_deleted'
  | 'settings_updated'
  | 'encryption_key_rotated'
  | 'access_granted'
  | 'access_revoked'
  | 'permission_changed'
  | 'session_created'
  | 'session_terminated'
  | 'anomaly_detected'
  | 'rate_limit_exceeded'
  | 'policy_violation';

export const EVENT_CATEGORIES: Record<AuditEventType, AuditEventCategory> = {
  authentication: 'auth',
  authorization: 'auth',
  data_access: 'data',
  data_modification: 'data',
  data_deletion: 'data',
  settings_change: 'security',
  security_event: 'security',
  admin_action: 'admin',
  compliance_event: 'compliance',
};

export const CRITICAL_EVENTS: AuditAction[] = [
  'password_change',
  'mfa_enabled',
  'mfa_disabled',
  'api_key_created',
  'api_key_deleted',
  'data_exported',
  'encryption_key_rotated',
  'access_granted',
  'access_revoked',
  'permission_changed',
  'anomaly_detected',
  'policy_violation',
];
