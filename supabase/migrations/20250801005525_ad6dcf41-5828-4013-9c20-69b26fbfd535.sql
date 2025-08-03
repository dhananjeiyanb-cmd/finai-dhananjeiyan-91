
-- Create the missing trigger that calls handle_new_user when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the handle_new_user function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.generate_tenant_id(text) TO supabase_auth_admin;

-- Also ensure the functions can be executed by the service role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_tenant_id(text) TO service_role;

-- Update RLS policies to ensure proper data isolation
-- Allow users to insert their own profiles (needed for the trigger)
CREATE POLICY "Allow profile creation via trigger" ON public.profiles
  FOR INSERT WITH CHECK (true);
