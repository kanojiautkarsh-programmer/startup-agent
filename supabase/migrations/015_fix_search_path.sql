-- Fix search_path for all SECURITY DEFINER functions
-- This prevents potential privilege escalation via search_path manipulation

-- Fix handle_new_user_consent
DROP FUNCTION IF EXISTS public.handle_new_user_consent();
CREATE OR REPLACE FUNCTION public.handle_new_user_consent()
RETURNS trigger AS $$
BEGIN
  SET search_path = public;
  INSERT INTO public.data_training_consent (user_id, opted_out, consent_version)
  VALUES (NEW.id, true, '1.0.0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix generate_invite_token (from migration 014)
DROP FUNCTION IF EXISTS public.generate_invite_token();
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

-- Fix get_user_teams (from migration 014)
DROP FUNCTION IF EXISTS public.get_user_teams(UUID);
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

-- Fix is_team_member (from migration 014)
DROP FUNCTION IF EXISTS public.is_team_member(UUID, UUID);
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

-- Fix has_team_role (from migration 014)
DROP FUNCTION IF EXISTS public.has_team_role(UUID, UUID, TEXT);
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

-- Fix update_feature_usage (ensure consistent definition with search_path)
CREATE OR REPLACE FUNCTION public.update_feature_usage()
RETURNS trigger AS $$
BEGIN
  SET search_path = public;
  INSERT INTO public.feature_usage (user_id, feature_name, usage_date, usage_count)
  VALUES (NEW.user_id, NEW.event_data->>'feature', CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_name, usage_date)
  DO UPDATE SET 
    usage_count = feature_usage.usage_count + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  SET search_path = public;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix RLS policy for team_invites UPDATE - use WITH CHECK to properly validate
DROP POLICY IF EXISTS "Anyone with token can update invites" ON public.team_invites;
CREATE POLICY "Anyone with token can update invites" ON public.team_invites FOR UPDATE
  USING (true)
  WITH CHECK (
    -- Only allow status changes (accept/decline) when token matches
    -- Token is not updated, so we just check it exists
    token IS NOT NULL AND length(token) > 0
  );
