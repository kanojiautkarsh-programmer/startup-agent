export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          openai_key_encrypted: string | null
          anthropic_key_encrypted: string | null
          gemini_key_encrypted: string | null
          e2ee_enabled: boolean | null
          e2ee_key_id: string | null
          sso_mandatory: boolean | null
          mfa_enabled: boolean | null
          mfa_method: 'totp' | 'sms' | 'email' | 'webauthn' | null
          company: string | null
          last_security_review: string | null
          security_review_token: string | null
          accepted_terms_version: string | null
          accepted_privacy_policy_version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          openai_key_encrypted?: string | null
          anthropic_key_encrypted?: string | null
          gemini_key_encrypted?: string | null
          e2ee_enabled?: boolean | null
          e2ee_key_id?: string | null
          sso_mandatory?: boolean | null
          mfa_enabled?: boolean | null
          mfa_method?: 'totp' | 'sms' | 'email' | 'webauthn' | null
          company?: string | null
          last_security_review?: string | null
          security_review_token?: string | null
          accepted_terms_version?: string | null
          accepted_privacy_policy_version?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          openai_key_encrypted?: string | null
          anthropic_key_encrypted?: string | null
          gemini_key_encrypted?: string | null
          e2ee_enabled?: boolean | null
          e2ee_key_id?: string | null
          sso_mandatory?: boolean | null
          mfa_enabled?: boolean | null
          mfa_method?: 'totp' | 'sms' | 'email' | 'webauthn' | null
          company?: string | null
          last_security_review?: string | null
          security_review_token?: string | null
          accepted_terms_version?: string | null
          accepted_privacy_policy_version?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          type: 'decision' | 'commitment' | 'context' | 'note'
          title: string
          content: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'decision' | 'commitment' | 'context' | 'note'
          title: string
          content: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'decision' | 'commitment' | 'context' | 'note'
          title?: string
          content?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          deadline: string | null
          status: 'active' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          deadline?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          deadline?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          progress?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'starter' | 'pro' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due'
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_end?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          event_type: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'data_deletion' | 'settings_change' | 'security_event' | 'admin_action' | 'compliance_event'
          event_category: 'auth' | 'data' | 'security' | 'compliance' | 'admin'
          resource_type: string
          resource_id: string | null
          action: string
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          status: 'success' | 'failure' | 'blocked'
          failure_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'data_deletion' | 'settings_change' | 'security_event' | 'admin_action' | 'compliance_event'
          event_category: 'auth' | 'data' | 'security' | 'compliance' | 'admin'
          resource_type: string
          resource_id?: string | null
          action: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          status: 'success' | 'failure' | 'blocked'
          failure_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'data_deletion' | 'settings_change' | 'security_event' | 'admin_action' | 'compliance_event'
          event_category?: 'auth' | 'data' | 'security' | 'compliance' | 'admin'
          resource_type?: string
          resource_id?: string | null
          action?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          status?: 'success' | 'failure' | 'blocked'
          failure_reason?: string | null
          created_at?: string
        }
      }
      sso_providers: {
        Row: {
          id: string
          name: string
          provider: 'saml' | 'oidc'
          enabled: boolean
          entity_id: string | null
          issuer: string | null
          sso_url: string | null
          acs_url: string | null
          client_id: string | null
          client_secret_encrypted: string | null
          private_key_encrypted: string | null
          certificate_encrypted: string | null
          authorization_endpoint: string | null
          token_endpoint: string | null
          userinfo_endpoint: string | null
          jwks_uri: string | null
          metadata_xml: string | null
          attribute_mapping: Json | null
          allowed_domains: string[] | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          provider: 'saml' | 'oidc'
          enabled?: boolean
          entity_id?: string | null
          issuer?: string | null
          sso_url?: string | null
          acs_url?: string | null
          client_id?: string | null
          client_secret_encrypted?: string | null
          private_key_encrypted?: string | null
          certificate_encrypted?: string | null
          authorization_endpoint?: string | null
          token_endpoint?: string | null
          userinfo_endpoint?: string | null
          jwks_uri?: string | null
          metadata_xml?: string | null
          attribute_mapping?: Json | null
          allowed_domains?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          provider?: 'saml' | 'oidc'
          enabled?: boolean
          entity_id?: string | null
          issuer?: string | null
          sso_url?: string | null
          acs_url?: string | null
          client_id?: string | null
          client_secret_encrypted?: string | null
          private_key_encrypted?: string | null
          certificate_encrypted?: string | null
          authorization_endpoint?: string | null
          token_endpoint?: string | null
          userinfo_endpoint?: string | null
          jwks_uri?: string | null
          metadata_xml?: string | null
          attribute_mapping?: Json | null
          allowed_domains?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      sso_links: {
        Row: {
          id: string
          user_id: string
          provider_id: string
          provider_user_id: string
          email: string | null
          metadata: Json | null
          linked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider_id: string
          provider_user_id: string
          email?: string | null
          metadata?: Json | null
          linked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider_id?: string
          provider_user_id?: string
          email?: string | null
          metadata?: Json | null
          linked_at?: string
        }
      }
      sso_sessions: {
        Row: {
          id: string
          user_id: string
          provider: 'saml' | 'oidc'
          provider_id: string | null
          email: string
          return_to: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'saml' | 'oidc'
          provider_id?: string | null
          email: string
          return_to?: string | null
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'saml' | 'oidc'
          provider_id?: string | null
          email?: string
          return_to?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      data_training_consent: {
        Row: {
          id: string
          user_id: string
          opted_out: boolean
          consent_version: string
          opt_out_date: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opted_out?: boolean
          consent_version?: string
          opt_out_date?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          opted_out?: boolean
          consent_version?: string
          opt_out_date?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      data_retention_policies: {
        Row: {
          id: string
          name: string
          data_type: string
          retention_days: number
          deletion_method: 'immediate' | 'grace_period' | 'anonymized'
          grace_period_days: number | null
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          data_type: string
          retention_days: number
          deletion_method: 'immediate' | 'grace_period' | 'anonymized'
          grace_period_days?: number | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          data_type?: string
          retention_days?: number
          deletion_method?: 'immediate' | 'grace_period' | 'anonymized'
          grace_period_days?: number | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_encryption_keys: {
        Row: {
          id: string
          user_id: string
          encrypted_key_encrypted: string
          salt: string
          algorithm: string
          key_fingerprint: string
          created_at: string
          last_used_at: string | null
          rotated_at: string | null
          previous_key_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          encrypted_key_encrypted: string
          salt: string
          algorithm?: string
          key_fingerprint: string
          created_at?: string
          last_used_at?: string | null
          rotated_at?: string | null
          previous_key_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          encrypted_key_encrypted?: string
          salt?: string
          algorithm?: string
          key_fingerprint?: string
          created_at?: string
          last_used_at?: string | null
          rotated_at?: string | null
          previous_key_id?: string | null
        }
      }
      compliance_reports: {
        Row: {
          id: string
          report_type: 'soc2' | 'hipaa' | 'gdpr' | 'custom'
          period_start: string
          period_end: string
          generated_by: string | null
          status: 'draft' | 'review' | 'approved' | 'archived'
          report_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_type: 'soc2' | 'hipaa' | 'gdpr' | 'custom'
          period_start: string
          period_end: string
          generated_by?: string | null
          status?: 'draft' | 'review' | 'approved' | 'archived'
          report_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_type?: 'soc2' | 'hipaa' | 'gdpr' | 'custom'
          period_start?: string
          period_end?: string
          generated_by?: string | null
          status?: 'draft' | 'review' | 'approved' | 'archived'
          report_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          device_info: Json | null
          location: Json | null
          sso_provider_id: string | null
          encryption_enabled: boolean
          created_at: string
          expires_at: string
          last_active_at: string
          terminated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          device_info?: Json | null
          location?: Json | null
          sso_provider_id?: string | null
          encryption_enabled?: boolean
          created_at?: string
          expires_at: string
          last_active_at?: string
          terminated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          device_info?: Json | null
          location?: Json | null
          sso_provider_id?: string | null
          encryption_enabled?: boolean
          created_at?: string
          expires_at?: string
          last_active_at?: string
          terminated_at?: string | null
        }
      }
      security_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: 'login_attempt' | 'failed_login' | 'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'api_key_access' | 'data_export' | 'permission_change' | 'anomaly_detected' | 'rate_limit_exceeded' | 'suspicious_activity'
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          resolved: boolean
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: 'login_attempt' | 'failed_login' | 'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'api_key_access' | 'data_export' | 'permission_change' | 'anomaly_detected' | 'rate_limit_exceeded' | 'suspicious_activity'
          severity: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: 'login_attempt' | 'failed_login' | 'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'api_key_access' | 'data_export' | 'permission_change' | 'anomaly_detected' | 'rate_limit_exceeded' | 'suspicious_activity'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Memory = Database['public']['Tables']['memories']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type SSOProvider = Database['public']['Tables']['sso_providers']['Row']
export type SSOLink = Database['public']['Tables']['sso_links']['Row']
export type DataTrainingConsent = Database['public']['Tables']['data_training_consent']['Row']
export type UserEncryptionKey = Database['public']['Tables']['user_encryption_keys']['Row']
export type SecurityEvent = Database['public']['Tables']['security_events']['Row']
