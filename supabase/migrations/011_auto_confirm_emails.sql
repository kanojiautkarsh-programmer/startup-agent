-- Auto-confirm emails on signup
-- Note: This requires Supabase project settings to be configured
-- Go to Authentication > Settings and disable "Confirm email"

-- Create a function to auto-confirm users (for reference)
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, auth;
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Note: auth.users is in the 'auth' schema, we can't directly add triggers there
-- The email confirmation must be disabled in Supabase Dashboard:
-- Authentication > Settings > Disable "Confirm email"
