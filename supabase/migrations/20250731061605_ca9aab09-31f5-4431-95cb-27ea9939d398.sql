-- Create budget_categories table
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT NOT NULL DEFAULT '💰',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_categories
CREATE POLICY "Users can view their own budget categories" 
ON public.budget_categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget categories" 
ON public.budget_categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" 
ON public.budget_categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" 
ON public.budget_categories FOR DELETE USING (auth.uid() = user_id);

-- Create income_sources table
CREATE TABLE IF NOT EXISTS public.income_sources (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for income_sources
CREATE POLICY "Users can view their own income sources" 
ON public.income_sources FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income sources" 
ON public.income_sources FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income sources" 
ON public.income_sources FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income sources" 
ON public.income_sources FOR DELETE USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'UPI',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON public.budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at
  BEFORE UPDATE ON public.income_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();