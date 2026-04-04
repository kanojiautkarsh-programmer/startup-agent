-- Team Collaboration Features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  avatar_url TEXT,
  plan TEXT DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add team_id to profiles for current team tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Add team_id to key tables for team-scoped data
ALTER TABLE public.memories 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE public.startup_profiles 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE public.startup_metrics 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE public.commitments 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE public.founder_journal 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_team ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);

-- RLS Policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Teams: owners and members can view, owners can update/delete
CREATE POLICY "Team owners and members can view teams" ON public.teams FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM team_members WHERE team_id = teams.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create teams" ON public.teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update teams" ON public.teams FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete teams" ON public.teams FOR DELETE
  USING (owner_id = auth.uid());

-- Team members: members can view, owners can manage
CREATE POLICY "Team members can view membership" ON public.team_members FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM teams WHERE id = team_members.team_id AND owner_id = auth.uid())
  );

CREATE POLICY "Team owners can manage members" ON public.team_members FOR ALL
  USING (EXISTS (SELECT 1 FROM teams WHERE id = team_members.team_id AND owner_id = auth.uid()));

CREATE POLICY "Users can create own membership" ON public.team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Team invites: owners can manage, anyone with valid token can accept
CREATE POLICY "Team owners can manage invites" ON public.team_invites FOR SELECT
  USING (EXISTS (SELECT 1 FROM teams WHERE id = team_invites.team_id AND owner_id = auth.uid()));

CREATE POLICY "Team owners can create invites" ON public.team_invites FOR INSERT
  USING (EXISTS (SELECT 1 FROM teams WHERE id = team_invites.team_id AND owner_id = auth.uid()));

CREATE POLICY "Anyone with token can update invites" ON public.team_invites FOR UPDATE
  USING (true);

CREATE POLICY "Team owners can delete invites" ON public.team_invites FOR DELETE
  USING (EXISTS (SELECT 1 FROM teams WHERE id = team_invites.team_id AND owner_id = auth.uid()));

-- Profiles: update current_team_id
CREATE POLICY "Users can update own team" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Team-scoped data: members can view team data
CREATE POLICY "Team members can view team memories" ON public.memories FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = memories.team_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create memories with team" ON public.memories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Team members can update team memories" ON public.memories FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = memories.team_id AND user_id = auth.uid()
    ))
  );

-- Similar policies for other team-scoped tables
CREATE POLICY "Team members can view team goals" ON public.goals FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = goals.team_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Team members can view team conversations" ON public.conversations FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = conversations.team_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Team members can view team documents" ON public.documents FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = documents.team_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Team members can view team startup profiles" ON public.startup_profiles FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = startup_profiles.team_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Team members can view team metrics" ON public.startup_metrics FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = startup_metrics.team_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Team members can view team commitments" ON public.commitments FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = commitments.team_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Team members can view team journal" ON public.founder_journal FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members WHERE team_id = founder_journal.team_id AND user_id = auth.uid()
    ))
  );

-- Function to generate invite token
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  SET search_path = public;
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get user's teams
CREATE OR REPLACE FUNCTION public.get_user_teams(user_uuid UUID)
RETURNS TABLE(id UUID, name TEXT, slug TEXT, role TEXT, member_count BIGINT) AS $$
BEGIN
  SET search_path = public;
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    tm.role,
    (SELECT COUNT(*) FROM team_members WHERE team_id = t.id)::BIGINT as member_count
  FROM teams t
  INNER JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = user_uuid
  ORDER BY tm.role = 'owner' DESC, t.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  SET search_path = public;
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if user has minimum role
CREATE OR REPLACE FUNCTION public.has_team_role(team_uuid UUID, user_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_hierarchy JSONB := '{
    "owner": 4,
    "admin": 3,
    "member": 2,
    "viewer": 1
  }'::JSONB;
BEGIN
  SET search_path = public;
  SELECT role INTO user_role FROM team_members
  WHERE team_id = team_uuid AND user_id = user_uuid;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (role_hierarchy->>user_role)::INT >= (role_hierarchy->>required_role)::INT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
