DROP FUNCTION IF EXISTS public.handle_new_user_consent();
DROP FUNCTION IF EXISTS public.generate_invite_token();
DROP FUNCTION IF EXISTS public.get_user_teams(UUID);
DROP FUNCTION IF EXISTS public.is_team_member(UUID, UUID);
DROP FUNCTION IF EXISTS public.has_team_role(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.update_feature_usage();
DROP FUNCTION IF EXISTS public.update_updated_at();
