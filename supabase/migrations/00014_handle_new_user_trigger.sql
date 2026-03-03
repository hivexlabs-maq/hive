-- =============================================================================
-- Migration: 00014_handle_new_user_trigger
-- Description: Auto-create a profile row when a new user signs up (OTP/magic link).
--              This fixes the "stuck after onboarding" flow where no profile existed.
-- =============================================================================

-- Function runs with SECURITY DEFINER so it can INSERT into public.profiles
-- even though the trigger fires from auth.users (no session yet).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(COALESCE(NEW.email, ''), '@', 1)
        ),
        'parent'
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists (e.g. re-run), ignore
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a default profile (role=parent) when a new auth user is created.';

-- Fire after insert on auth.users (Supabase Auth creates the user on signup/OTP).
-- Drop first so this migration is safe to run again.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();
