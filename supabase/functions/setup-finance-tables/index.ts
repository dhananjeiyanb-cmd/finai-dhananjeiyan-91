import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create budget_categories table
    await supabaseClient.rpc('create_table_if_not_exists', {
      table_name: 'budget_categories',
      table_definition: `
        CREATE TABLE IF NOT EXISTS budget_categories (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          budget DECIMAL(10,2) NOT NULL DEFAULT 0,
          spent DECIMAL(10,2) NOT NULL DEFAULT 0,
          color TEXT NOT NULL DEFAULT '#3B82F6',
          icon TEXT NOT NULL DEFAULT '💰',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        
        ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own budget categories" 
        ON budget_categories FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can insert their own budget categories" 
        ON budget_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can update their own budget categories" 
        ON budget_categories FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can delete their own budget categories" 
        ON budget_categories FOR DELETE USING (auth.uid() = user_id);
        
        CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);
      `
    });

    // Create income_sources table
    await supabaseClient.rpc('create_table_if_not_exists', {
      table_name: 'income_sources',
      table_definition: `
        CREATE TABLE IF NOT EXISTS income_sources (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          date DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        
        ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own income sources" 
        ON income_sources FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can insert their own income sources" 
        ON income_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can update their own income sources" 
        ON income_sources FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can delete their own income sources" 
        ON income_sources FOR DELETE USING (auth.uid() = user_id);
        
        CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON income_sources(user_id);
      `
    });

    // Create transactions table
    await supabaseClient.rpc('create_table_if_not_exists', {
      table_name: 'transactions',
      table_definition: `
        CREATE TABLE IF NOT EXISTS transactions (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          description TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          category TEXT NOT NULL,
          mode TEXT NOT NULL DEFAULT 'UPI',
          status TEXT NOT NULL DEFAULT 'completed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own transactions" 
        ON transactions FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can insert their own transactions" 
        ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can update their own transactions" 
        ON transactions FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can delete their own transactions" 
        ON transactions FOR DELETE USING (auth.uid() = user_id);
        
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
      `
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Finance tables created successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})