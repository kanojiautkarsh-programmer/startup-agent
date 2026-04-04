-- Analytics and user activity tracking tables

-- Track user activities and events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view',
    'feature_used',
    'ai_chat',
    'document_uploaded',
    'goal_created',
    'goal_completed',
    'integration_connected',
    'integration_disconnected',
    'onboarding_completed',
    'search_performed',
    'export_requested',
    'button_clicked',
    'form_submitted',
    'error_occurred',
    'session_start',
    'session_end'
  )),
  event_data JSONB DEFAULT '{}',
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  last_page TEXT,
  country TEXT,
  device_type TEXT
);

-- Feature usage aggregates (daily)
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_date DATE NOT NULL,
  usage_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_name, usage_date)
);

-- RLS for analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only see their own data
CREATE POLICY "Users can view own analytics" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feature usage" ON public.feature_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feature usage" ON public.feature_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feature usage" ON public.feature_usage FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_date ON public.feature_usage(user_id, usage_date);

-- Function to auto-update feature usage
CREATE OR REPLACE FUNCTION update_feature_usage()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  INSERT INTO feature_usage (user_id, feature_name, usage_date, usage_count)
  VALUES (NEW.user_id, NEW.event_data->>'feature', CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_name, usage_date)
  DO UPDATE SET 
    usage_count = feature_usage.usage_count + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-track feature usage
CREATE OR REPLACE TRIGGER track_feature_usage
AFTER INSERT ON analytics_events
FOR EACH ROW
WHEN (NEW.event_type = 'feature_used' AND NEW.event_data ? 'feature')
EXECUTE FUNCTION update_feature_usage();
