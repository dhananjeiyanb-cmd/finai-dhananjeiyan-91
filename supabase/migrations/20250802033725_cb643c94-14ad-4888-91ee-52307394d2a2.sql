
-- First, let's ensure the generate_tenant_id function exists and works correctly
CREATE OR REPLACE FUNCTION public.generate_tenant_id(user_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  base_id TEXT;
  counter INTEGER := 1;
  final_id TEXT;
BEGIN
  -- Take first 4 letters from name (uppercase)
  base_id := UPPER(LEFT(REGEXP_REPLACE(user_name, '[^a-zA-Z]', '', 'g'), 4));
  
  -- Pad with 'X' if less than 4 characters
  WHILE LENGTH(base_id) < 4 LOOP
    base_id := base_id || 'X';
  END LOOP;
  
  -- Generate unique ID with counter
  LOOP
    final_id := base_id || LPAD(counter::TEXT, 4, '0');
    
    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE tenant_id = final_id) THEN
      RETURN final_id;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$function$;

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    generate_tenant_id(COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'))
  );
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.generate_tenant_id(text) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Ensure RLS is properly configured
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
