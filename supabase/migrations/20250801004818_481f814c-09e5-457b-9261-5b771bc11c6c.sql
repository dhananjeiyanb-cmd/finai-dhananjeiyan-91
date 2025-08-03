
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  tenant_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to generate unique tenant ID
CREATE OR REPLACE FUNCTION generate_tenant_id(user_name TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    generate_tenant_id(COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Multi-tenant budget categories table
CREATE TABLE public.budget_categories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id TEXT REFERENCES public.profiles(tenant_id) NOT NULL,
  name TEXT NOT NULL,
  budget DECIMAL(10,2) DEFAULT 0,
  spent DECIMAL(10,2) DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'wallet',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Multi-tenant income sources table
CREATE TABLE public.income_sources (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id TEXT REFERENCES public.profiles(tenant_id) NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Multi-tenant transactions table
CREATE TABLE public.transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id TEXT REFERENCES public.profiles(tenant_id) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  mode TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_categories
CREATE POLICY "Users can manage own budget categories" ON public.budget_categories
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for income_sources  
CREATE POLICY "Users can manage own income sources" ON public.income_sources
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);
