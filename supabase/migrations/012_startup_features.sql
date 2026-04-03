-- Startup-specific features for TaskLyne

-- Startup profiles table
CREATE TABLE IF NOT EXISTS public.startup_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT,
  industry TEXT,
  stage TEXT CHECK (stage IN ('pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'profit')),
  founded_date DATE,
  website TEXT,
  tagline TEXT,
  description TEXT,
  target_market TEXT,
  competitors TEXT[],
  current_challenges TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Startup metrics tracking
CREATE TABLE IF NOT EXISTS public.startup_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  mrr NUMERIC(12, 2) DEFAULT 0,
  arr NUMERIC(12, 2) DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  trials INTEGER DEFAULT 0,
  paying_customers INTEGER DEFAULT 0,
  churn_rate NUMERIC(5, 2) DEFAULT 0,
  burn_rate NUMERIC(12, 2) DEFAULT 0,
  runway_months NUMERIC(6, 2),
  runway_end_date DATE,
  arr_growth_rate NUMERIC(8, 2) DEFAULT 0,
  net_revenue NUMERIC(12, 2) DEFAULT 0,
  cac NUMERIC(10, 2) DEFAULT 0,
  ltv NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Weekly reviews
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  accomplishments TEXT,
  blockers TEXT,
  next_week_priorities TEXT,
  ai_summary TEXT,
  metrics_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Founder journal/notes
CREATE TABLE IF NOT EXISTS public.founder_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  tags TEXT[],
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'challenging', 'difficult')),
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor relationships
CREATE TABLE IF NOT EXISTS public.investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  firm TEXT,
  type TEXT CHECK (type IN ('angel', 'vc', 'family-office', 'strategic', 'institutional')),
  stage_preference TEXT,
  check_size_min NUMERIC(12, 2),
  check_size_max NUMERIC(12, 2),
  portfolio_companies TEXT[],
  contact_email TEXT,
  contact_linkedin TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('prospect', 'contacted', 'meeting', 'due-diligence', 'passed', 'invested', 'not-interested')) DEFAULT 'prospect',
  last_contact DATE,
  next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting logs
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  attendees TEXT[],
  meeting_type TEXT CHECK (meeting_type IN ('investor', 'customer', 'partner', 'team', 'advisor', 'other')),
  summary TEXT,
  action_items TEXT[],
  follow_up_date DATE,
  investor_id UUID REFERENCES investors(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commitments tracker
CREATE TABLE IF NOT EXISTS public.commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  committed_to TEXT,
  deadline DATE,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'missed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- RLS policies - users own their data
CREATE POLICY "Users manage own startup profile" ON public.startup_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own metrics" ON public.startup_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reviews" ON public.weekly_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own journal" ON public.founder_journal FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own investors" ON public.investors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own meetings" ON public.meetings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own commitments" ON public.commitments FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_startup_metrics_user_date ON public.startup_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON public.weekly_reviews(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_founder_journal_user_date ON public.founder_journal(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_investors_user ON public.investors(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_date ON public.meetings(user_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_commitments_user_status ON public.commitments(user_id, status);
