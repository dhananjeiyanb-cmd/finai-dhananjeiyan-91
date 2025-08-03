import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id } = await req.json();
    
    if (!message || !user_id) {
      throw new Error('Message and user_id are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = `https://mtldnjtcnlululyfhghj.supabase.co`;
    const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bGRuanRjbmx1bHVseWZoZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDU0NDAsImV4cCI6MjA2OTQyMTQ0MH0.TIc3MdIvIN3IrEvnxH9_wCd_oBOy-79UKxZmSHuKriA`;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's financial data
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    const { data: budgetCategories, error: budgetError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', user_id);

    if (budgetError) {
      console.error('Error fetching budget categories:', budgetError);
    }

    const { data: incomeData, error: incomeError } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', user_id);

    if (incomeError) {
      console.error('Error fetching income data:', incomeError);
    }

    // Prepare financial context for OpenAI
    const financialContext = {
      transactions: transactions || [],
      budgetCategories: budgetCategories || [],
      incomeData: incomeData || [],
      totalTransactions: transactions?.length || 0,
      totalBudgetCategories: budgetCategories?.length || 0
    };

    const systemPrompt = `You are FinPilot, an AI financial assistant specializing in personal finance analysis. Your task is to help users analyze their spending patterns and provide actionable financial advice.

IMPORTANT: When a user asks about spending analysis by category and time period, follow this structured approach:

1. FIRST, ask for specific details if not provided:
   - Start date of the period (format: YYYY-MM-DD)
   - End date of the period (format: YYYY-MM-DD) 
   - Specific category to analyze (if not mentioned)

2. THEN, analyze the provided financial data:
   - Filter transactions by the specified date range and category
   - Calculate total spent in that category during the period
   - Compare against budget (if available)
   - Identify spending patterns and trends

3. FINALLY, provide:
   - Clear summary with total amount spent
   - Budget comparison (if applicable)
   - Practical suggestions for budget management
   - Recommendations for financial tools or services
   - Tips for adjusting spending habits

Available financial data for analysis:
- Total transactions: ${financialContext.totalTransactions}
- Budget categories: ${financialContext.totalBudgetCategories}
- Transaction categories: ${[...new Set(transactions?.map(t => t.category) || [])].join(', ')}

Current financial snapshot:
${JSON.stringify(financialContext, null, 2)}

Provide helpful, actionable advice based on the user's actual financial data. If asking for specific date ranges or categories, be conversational and helpful.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      financialSummary: {
        totalTransactions: financialContext.totalTransactions,
        availableCategories: [...new Set(transactions?.map(t => t.category) || [])],
        budgetCategories: budgetCategories?.map(bc => ({ name: bc.name, budget: bc.budget, spent: bc.spent })) || []
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI financial assistant:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});