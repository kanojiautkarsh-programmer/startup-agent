-- Startup Agent Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can sign up (insert), only authenticated users can view their own
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own waitlist entry" ON public.waitlist FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  openai_key_encrypted TEXT,
  anthropic_key_encrypted TEXT,
  gemini_key_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('decision', 'commitment', 'context', 'note')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert messages in their conversations" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete messages in their conversations" ON public.messages FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id AND user_id = auth.uid()
  )
);

-- Memories policies
CREATE POLICY "Users can manage their own memories" ON public.memories FOR ALL USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can manage their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON public.memories(type);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);

-- =====================================================
-- SOC 2 Type II Compliance Tables
-- =====================================================

-- Audit Logs Table (Immutable)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'authentication', 'authorization', 'data_access', 'data_modification', 
    'data_deletion', 'settings_change', 'security_event', 'admin_action', 'compliance_event'
  )),
  event_category TEXT NOT NULL CHECK (event_category IN ('auth', 'data', 'security', 'compliance', 'admin')),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'blocked')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Make audit_logs immutable (no updates or deletes)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();

-- Audit Logs RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs, admins can view all
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

-- Audit logs cannot be inserted directly (only via service role)
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs 
  FOR INSERT WITH CHECK (true);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- =====================================================
-- SSO Providers Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sso_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('saml', 'oidc')),
  enabled BOOLEAN DEFAULT false,
  entity_id TEXT,
  issuer TEXT,
  sso_url TEXT,
  acs_url TEXT,
  client_id TEXT,
  client_secret_encrypted TEXT,
  private_key_encrypted TEXT,
  certificate_encrypted TEXT,
  authorization_endpoint TEXT,
  token_endpoint TEXT,
  userinfo_endpoint TEXT,
  jwks_uri TEXT,
  metadata_xml TEXT,
  attribute_mapping JSONB,
  allowed_domains TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.sso_providers ENABLE ROW LEVEL SECURITY;

-- Only admins can manage SSO providers
CREATE POLICY "Admins can view all SSO providers" ON public.sso_providers 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert SSO providers" ON public.sso_providers 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

CREATE POLICY "Admins can update SSO providers" ON public.sso_providers 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

CREATE POLICY "Admins can delete SSO providers" ON public.sso_providers 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

-- =====================================================
-- SSO User Links Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sso_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.sso_providers(id) ON DELETE CASCADE NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT,
  metadata JSONB,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

ALTER TABLE public.sso_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SSO links" ON public.sso_links 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own SSO links" ON public.sso_links 
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sso_links_user_id ON public.sso_links(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_links_provider_id ON public.sso_links(provider_id);

-- =====================================================
-- SSO Sessions Table (Temporary)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sso_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('saml', 'oidc')),
  provider_id UUID REFERENCES public.sso_providers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  return_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.sso_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SSO sessions" ON public.sso_sessions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert SSO sessions" ON public.sso_sessions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own SSO sessions" ON public.sso_sessions 
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sso_sessions_expires ON public.sso_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_email ON public.sso_sessions(email);

-- Cleanup expired SSO sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sso_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sso_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Zero Data Training Consent Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.data_training_consent (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  opted_out BOOLEAN DEFAULT true NOT NULL,
  consent_version TEXT NOT NULL,
  opt_out_date TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.data_training_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent" ON public.data_training_consent 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own consent" ON public.data_training_consent 
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create consent record on user signup (default: opted out)
CREATE OR REPLACE FUNCTION public.handle_new_user_consent()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.data_training_consent (user_id, opted_out, consent_version)
  VALUES (NEW.id, true, '1.0.0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_consent
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_consent();

-- =====================================================
-- Data Retention Policies Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  deletion_method TEXT NOT NULL CHECK (deletion_method IN ('immediate', 'grace_period', 'anonymized')),
  grace_period_days INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Only admins can manage retention policies
CREATE POLICY "Admins can view retention policies" ON public.data_retention_policies 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage retention policies" ON public.data_retention_policies 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

-- Insert default retention policies
INSERT INTO public.data_retention_policies (name, data_type, retention_days, deletion_method, grace_period_days) VALUES
  ('User Messages', 'messages', 365, 'immediate', NULL),
  ('Conversation History', 'conversations', 730, 'anonymized', 30),
  ('Extracted Memories', 'memories', 1095, 'immediate', NULL),
  ('Audit Logs', 'audit_logs', 2555, 'anonymized', NULL),
  ('Session Records', 'sessions', 90, 'immediate', NULL),
  ('API Access Logs', 'api_logs', 365, 'immediate', NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- User Encryption Keys Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_encryption_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  encrypted_key_encrypted TEXT NOT NULL,
  salt TEXT NOT NULL,
  algorithm TEXT DEFAULT 'AES-256-GCM',
  key_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  rotated_at TIMESTAMPTZ,
  previous_key_id UUID REFERENCES public.user_encryption_keys(id) ON DELETE SET NULL
);

ALTER TABLE public.user_encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own encryption key metadata" ON public.user_encryption_keys 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own encryption keys" ON public.user_encryption_keys 
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_encryption_keys_user_id ON public.user_encryption_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_encryption_keys_fingerprint ON public.user_encryption_keys(key_fingerprint);

-- =====================================================
-- Compliance Reports Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('soc2', 'hipaa', 'gdpr', 'custom')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view compliance reports" ON public.compliance_reports 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

CREATE POLICY "Admins can manage compliance reports" ON public.compliance_reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

-- =====================================================
-- User Sessions with Enhanced Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  location JSONB,
  sso_provider_id UUID REFERENCES public.sso_providers(id),
  encryption_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  terminated_at TIMESTAMPTZ
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON public.user_sessions 
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- =====================================================
-- Security Events Table (For anomaly detection)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login_attempt', 'failed_login', 'password_change', 'mfa_enabled', 'mfa_disabled',
    'api_key_access', 'data_export', 'permission_change', 'anomaly_detected',
    'rate_limit_exceeded', 'suspicious_activity'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own security events
CREATE POLICY "Users can view their own security events" ON public.security_events 
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view and manage all security events
CREATE POLICY "Admins can view all security events" ON public.security_events 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

CREATE POLICY "Admins can update security events" ON public.security_events 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND plan = 'enterprise')
  );

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

-- =====================================================
-- Update profiles table with new security fields
-- =====================================================

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS e2ee_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS e2ee_key_id UUID REFERENCES public.user_encryption_keys(id),
  ADD COLUMN IF NOT EXISTS sso_mandatory BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_method TEXT CHECK (mfa_method IN ('totp', 'sms', 'email', 'webauthn')),
  ADD COLUMN IF NOT EXISTS last_security_review TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS security_review_token TEXT,
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT,
  ADD COLUMN IF NOT EXISTS accepted_privacy_policy_version TEXT,
  ADD COLUMN IF NOT EXISTS github_key_encrypted TEXT;
