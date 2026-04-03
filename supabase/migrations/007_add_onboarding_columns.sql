-- Add onboarding fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS funding_stage TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

-- Create integrations table for tracking connected services
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('slack', 'notion', 'github', 'linear')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error', 'disconnected')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Add RLS for integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own integrations" ON public.integrations 
  FOR ALL USING (auth.uid() = user_id);

-- Add quarter column to goals if not exists
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS quarter TEXT;
